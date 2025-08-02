

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, transactions as initialTransactions, categorySpending } from "@/lib/data";
import { Download, Upload, Edit, Home, ShoppingCart, Zap, Car, Phone, Tv, CircleCheck, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Transaction, Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { categorizeTransaction } from "@/ai/flows/categorize-transaction-flow";


function parseFlexibleDate(dateStr: string | number): Date | null {
    if (typeof dateStr === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        return new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
    }
    
    if (typeof dateStr === 'string') {
        const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'dd-MMM-yy', 'MM/dd/yyyy'];
        for (const fmt of formats) {
            const parsedDate = parse(dateStr, fmt, new Date());
            if (isValid(parsedDate)) {
                return parsedDate;
            }
        }
    }
    
    // Fallback for ISO strings or other standard formats
    const fallbackDate = new Date(dateStr);
    if (isValid(fallbackDate)) {
        return fallbackDate;
    }

    return null;
}


export default function AccountDetailPage() {
    const params = useParams();
    const accountId = params.accountId as string;
    
    const accountDetails = useMemo(() => accounts.find(a => a.id === accountId), [accountId]);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [customCategory, setCustomCategory] = useState<string>('');
    const [applyToAll, setApplyToAll] = useState<boolean>(true);
    const [lastPaidDate, setLastPaidDate] = useState<Date | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (accountId) {
            const accountTransactions = initialTransactions.filter(t => t.accountId === accountId);
            setTransactions(accountTransactions);
        }
    }, [accountId]);
    
    const { accountBalance, totalUsage, totalPayments } = useMemo(() => {
        let balance = 0;
        let usage = 0;
        let payments = 0;
        
        const isCreditCard = accountDetails?.type === 'Credit Card';
        const creditLimit = 35200;

        if (isCreditCard) {
            balance = -creditLimit;
        }

        const cycleTransactions = lastPaidDate 
            ? transactions.filter(t => new Date(t.date) >= lastPaidDate)
            : transactions;

        transactions.forEach(t => {
            if (t.type === 'income') {
                balance += t.amount;
            } else if (t.type === 'expense') {
                balance -= t.amount;
            }
        });
        
        cycleTransactions.forEach(t => {
             if (t.type === 'income') {
                payments += t.amount;
            } else if (t.type === 'expense') {
                usage += t.amount;
            }
        });

        return { accountBalance: balance, totalUsage: usage, totalPayments: payments };
    }, [transactions, lastPaidDate, accountDetails]);


    const spendingByCategoryChartData = useMemo(() => {
        const spending = transactions
            .filter(t => t.type === 'expense' && t.category !== 'Uncategorized')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = { value: 0, fill: `hsl(var(--chart-${(Object.keys(acc).length % 5) + 1}))` };
                }
                acc[t.category].value += t.amount;
                return acc;
            }, {} as Record<string, { value: number, fill: string }>);

        return Object.entries(spending)
            .map(([category, data]) => ({ name: category, ...data }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const totalSpending = useMemo(() => {
        return spendingByCategoryChartData.reduce((acc, item) => acc + item.value, 0);
    }, [spendingByCategoryChartData]);

    if (!accountDetails) {
        return <div className="p-8">Account not found.</div>
    }

    const handleMarkAsPaid = (paymentDate: string) => {
        const date = startOfDay(new Date(paymentDate));
        setLastPaidDate(date);
        toast({
            title: "Statement Marked as Paid",
            description: `Usage and payments will now be calculated from ${format(date, 'PPP')}.`,
        });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const processData = async (data: any[][]) => {
        try {
            if (accountDetails.type === 'Credit Card') {
                await processCreditCardStatement(data);
            } else {
                await processStandardStatement(data);
            }
        } catch (error: any) {
             console.error("Import failed:", error);
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: error.message || "An unexpected error occurred during import.",
            });
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const processCreditCardStatement = async (data: any[][]) => {
        const rows = data.slice(1);
        
        const newTransactions: Transaction[] = await Promise.all(rows.map(async (row, index) => {
            const originalRowNumber = index + 2;

            if (!row || row.length < 4 || row.every(cell => cell === null || cell === "")) return null;

            const [dateStr, description, crDr, amountStr] = row;
            
            if (!dateStr || !description || crDr === undefined || crDr === null || amountStr === undefined || amountStr === null) {
                throw new Error(`Invalid data on row ${originalRowNumber}: Each row must have at least 4 values. Found: ${row.join(', ')}`);
            }

            const date = parseFlexibleDate(dateStr);
            if (!date) throw new Error(`Invalid date on row ${originalRowNumber}: '${dateStr}'`);

            const amount = parseFloat(String(amountStr).replace(/,/g, ''));
            if (isNaN(amount)) throw new Error(`Invalid amount on row ${originalRowNumber}: '${amountStr}'`);
            
            const descriptionStr = String(description).trim();
            const typeRaw = String(crDr).trim().toUpperCase();
            let type: 'income' | 'expense' = 'expense';
            let category: Transaction['category'] = 'Uncategorized';
            
            if (typeRaw === 'CR' || descriptionStr.toLowerCase().includes('payment received, thank')) {
                type = 'income';
                category = 'Credit Card Payment';
            } else {
                type = 'expense';
            }

            if(category === 'Uncategorized') {
                category = await categorizeTransaction({ description: descriptionStr });
            }

            return {
                id: `imported_${Date.now()}_${index}`,
                date: date.toISOString(),
                description: descriptionStr,
                amount: amount,
                type: type,
                category: category,
                accountId: accountId,
            };
        }));

        const validTransactions = newTransactions.filter((t): t is Transaction => t !== null);

        if (validTransactions.length === 0) {
            toast({ variant: "destructive", title: "Import Error", description: "The selected file is empty or does not contain valid data." });
            return;
        }

        setTransactions(prev => [...validTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({ title: "Import Successful", description: `${validTransactions.length} transaction(s) have been imported.` });
    };

    const processStandardStatement = async (data: any[][]) => {
         const headers = data[0].map(h => String(h).trim());
         const dateIndex = headers.indexOf('Posting Date');
         const descIndex = headers.indexOf('Description');
         const debitIndex = headers.indexOf('Debit Amount');
         const creditIndex = headers.indexOf('Credit Amount');

        if (dateIndex === -1 || descIndex === -1 || debitIndex === -1 || creditIndex === -1) {
            throw new Error("Invalid file headers. Expected 'Posting Date', 'Description', 'Debit Amount', 'Credit Amount'.");
        }

        const rows = data.slice(1);
        const newTransactions: Transaction[] = await Promise.all(rows.map(async (row, index) => {
            const originalRowNumber = index + 2;

            if (!row || row.every(cell => cell === null || cell === "")) return null;

            const dateStr = row[dateIndex];
            const description = row[descIndex];
            const debit = row[debitIndex];
            const credit = row[creditIndex];

            if (!dateStr || !description) return null;

            const date = parseFlexibleDate(dateStr);
            if (!date) throw new Error(`Invalid date on row ${originalRowNumber}: '${dateStr}'`);

            const debitAmount = debit ? parseFloat(String(debit).replace(/,/g, '')) : 0;
            const creditAmount = credit ? parseFloat(String(credit).replace(/,/g, '')) : 0;
            
            if (isNaN(debitAmount) || isNaN(creditAmount)) throw new Error(`Invalid amount on row ${originalRowNumber}.`);

            const amount = debitAmount || creditAmount;
            const type = debitAmount > 0 ? 'expense' : 'income';
            
            const descriptionStr = String(description).trim();
            let category: Transaction['category'] = 'Uncategorized';

            if(category === 'Uncategorized') {
                category = await categorizeTransaction({ description: descriptionStr });
            }

            return {
                id: `imported_${Date.now()}_${index}`,
                date: date.toISOString(),
                description: descriptionStr,
                amount: amount,
                type: type,
                category: category,
                accountId: accountId,
            };
        }));
        
        const validTransactions = newTransactions.filter((t): t is Transaction => t !== null);

         if (validTransactions.length === 0) {
            toast({ variant: "destructive", title: "Import Error", description: "The selected file is empty or does not contain valid data." });
            return;
        }

        setTransactions(prev => [...validTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({ title: "Import Successful", description: `${validTransactions.length} transaction(s) have been imported.` });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        const processFile = (data: any) => {
            const workbook = XLSX.read(data, { type: file.name.endsWith('.csv') ? 'string' : 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false, dateNF:'dd/mm/yyyy' });
            processData(json as any[][]);
        };

        if (file.name.endsWith('.csv')) {
             reader.onload = (e) => processFile(e.target?.result);
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            reader.onload = (e) => processFile(e.target?.result);
            reader.readAsArrayBuffer(file);
        } else {
             toast({
                variant: "destructive",
                title: "Unsupported File Type",
                description: "Please upload a .csv or .xlsx file.",
            });
        }

        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the selected file.",
            });
        };
    };

    const handleSaveCategory = () => {
        if (!editingTransaction) return;

        const finalCategory = selectedCategory === 'Other' ? customCategory.trim() : selectedCategory;

        if (!finalCategory) {
            toast({
                variant: "destructive",
                title: "Category not selected",
                description: "Please select or enter a category.",
            });
            return;
        }

        let updatedCount = 0;
        setTransactions(prev => {
            const newTransactions = prev.map(t => {
                const isMatchingTransaction = t.id === editingTransaction.id || 
                    (applyToAll && t.description === editingTransaction.description && t.category === 'Uncategorized');

                if (isMatchingTransaction) {
                    if (t.category !== finalCategory) {
                        updatedCount++;
                    }
                    return { ...t, category: finalCategory as Transaction['category'] };
                }
                return t;
            });
            return newTransactions;
        });

        setEditingTransaction(null);
        setSelectedCategory('');
        setCustomCategory('');

        toast({
            title: "Transactions Updated",
            description: `${updatedCount} transaction(s) have been categorized as "${finalCategory}".`,
        });
    };
    
    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setSelectedCategory(transaction.category);
        setCustomCategory('');
        setApplyToAll(true);
    };

    const handleCloseDialog = () => {
        setEditingTransaction(null);
        setSelectedCategory('');
        setCustomCategory('');
    }

    const categoryIcons: { [key: string]: React.ReactNode } = {
        'Rent/Mortgage': <Home className="w-4 h-4" />,
        'Groceries': <ShoppingCart className="w-4 h-4" />,
        'Electric': <Zap className="w-4 h-4" />,
        'Transportation': <Car className="w-4 h-4" />,
        'Phone': <Phone className="w-4 h-4" />,
        'TV': <Tv className="w-4 h-4" />,
        'Food': <ShoppingCart className="w-4 h-4" />,
        'Lifestyle': <Home className="w-4 h-4" />,
        'Spends': <Zap className="w-4 h-4" />,
        'Investment': <Zap className="w-4 h-4" />,
        'Salary': <Zap className="w-4 h-4" />,
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">{accountDetails.name}</h1>
            <p className="text-lg text-muted-foreground">{accountDetails.bank}</p>
        </div>
        <div className="flex items-center gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4"/> Import</Button>
            <Button variant="outline" asChild>
                <Link href="/transactions-template.csv" download>
                    <Download className="mr-2 h-4 w-4"/> Download Template
                </Link>
            </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{formatCurrency(accountBalance)}</p>
            </CardContent>
        </Card>
        {accountDetails.type === 'Credit Card' && (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Usage</CardTitle>
                        {lastPaidDate && <CardDescription>Since {format(lastPaidDate, 'PPP')}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(totalUsage)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Payments</CardTitle>
                         {lastPaidDate && <CardDescription>Since {format(lastPaidDate, 'PPP')}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(totalPayments)}</p>
                    </CardContent>
                </Card>
            </>
        )}

        <Card className="col-span-full">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2">
                        {spendingByCategoryChartData.length > 0 ? (
                            <div className="relative w-full h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Pie
                                            data={spendingByCategoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {spendingByCategoryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-sm text-muted-foreground">Monthly</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[350px] bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">Categorize expense transactions to see the chart</p>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-1 space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">TOTAL SPENDING</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
                            <p className="text-xs text-muted-foreground">For this time period</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground">AVERAGE SPENDING</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
                            <p className="text-xs text-muted-foreground">Per month</p>
                        </div>
                        <Separator />
                        <div>
                             <h4 className="text-sm font-semibold mb-2">CATEGORIES</h4>
                             <ul className="space-y-2">
                                {spendingByCategoryChartData.map((item) => (
                                    <li key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                            <span className="text-muted-foreground">{categoryIcons[item.name]}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(item.value)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>


        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                 <TransactionTable transactions={transactions} onEdit={handleEditClick} />
            </CardContent>
        </Card>
      </div>

       <Dialog open={!!editingTransaction} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Categorize Transaction</DialogTitle>
                    <DialogDescription>
                        Select a category for: "{editingTransaction?.description}"
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                <SelectItem value="Investment">Investment</SelectItem>
                                <SelectItem value="Spends">Spends</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Transport">Transportation</SelectItem>
                                <SelectItem value="Groceries">Groceries</SelectItem>
                                <SelectItem value="Salary">Salary</SelectItem>
                                <SelectItem value="Rent/Mortgage">Rent/Mortgage</SelectItem>
                                <SelectItem value="Other">Other (Custom)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCategory === 'Other' && (
                        <div>
                            <Label htmlFor="custom-category">Custom Category</Label>
                            <Input 
                                id="custom-category" 
                                placeholder="Enter your custom tag"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="apply-to-all" 
                            checked={applyToAll} 
                            onCheckedChange={(checked) => setApplyToAll(checked as boolean)}
                        />
                        <Label htmlFor="apply-to-all" className="text-sm font-normal">
                            Apply to all uncategorized transactions with this description.
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveCategory}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

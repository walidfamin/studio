
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, transactions as initialTransactions } from "@/lib/data";
import { Download, Upload, Edit } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';


function parseFlexibleDate(dateStr: string | number): Date {
    if (typeof dateStr === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        return new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
    }
    
    if (typeof dateStr === 'string') {
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                let year = parseInt(parts[2], 10);

                if (year < 100) {
                    year += 2000;
                }
                
                const date = new Date(Date.UTC(year, month, day));

                if (date.getUTCDate() === day && date.getUTCMonth() === month && date.getUTCFullYear() === year) {
                    return date;
                }
            }
        }
    }
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
    }
    return new Date('invalid');
}


export default function AccountDetailPage() {
    const params = useParams();
    const accountId = params.accountId as string;
    
    const accountDetails = useMemo(() => accounts.find(a => a.id === accountId), [accountId]);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [customCategory, setCustomCategory] = useState<string>('');

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

        transactions.forEach(t => {
            if (t.type === 'income') {
                balance += t.amount;
                payments += t.amount;
            } else if (t.type === 'expense') {
                balance -= t.amount;
                usage += t.amount;
            }
        });

        return { accountBalance: balance, totalUsage: usage, totalPayments: payments };
    }, [transactions]);


    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    if (!accountDetails) {
        return <div className="p-8">Account not found.</div>
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const processData = (data: any[][]) => {
        try {
            const rows = data.slice(1);
            
            const newTransactions: Transaction[] = rows.map((row, index) => {
                const originalRowNumber = index + 2;

                if (!row || row.length < 4 || row.every(cell => cell === null || cell === "")) {
                    console.warn(`Skipping empty or invalid row ${originalRowNumber}:`, row);
                    return null;
                }

                const [dateStr, description, crDr, amountStr] = row;
                
                if (!dateStr || !description || crDr === undefined || crDr === null || amountStr === undefined || amountStr === null) {
                    throw new Error(`Invalid data on row ${originalRowNumber}: Each row must have at least 4 values. Found: ${row.join(', ')}`);
                }

                const date = parseFlexibleDate(dateStr);

                if (isNaN(date.getTime())) {
                    throw new Error(`Invalid date on row ${originalRowNumber}: '${dateStr}'`);
                }

                const amount = parseFloat(amountStr);
                if (isNaN(amount)) {
                    throw new Error(`Invalid amount on row ${originalRowNumber}: '${amountStr}' is not a valid number.`);
                }
                
                const descriptionStr = String(description).trim();
                const typeRaw = String(crDr).trim().toUpperCase();
                let type: 'income' | 'expense' = 'expense';
                let category = 'Uncategorized';
                
                if (accountDetails?.type === 'Credit Card') {
                    if (typeRaw === 'CR' || descriptionStr.toLowerCase().includes('payment received, thank')) {
                        type = 'income';
                        category = 'Credit Card Payment';
                    } else {
                        type = 'expense';
                    }
                } else {
                    type = typeRaw === 'CR' ? 'income' : 'expense';
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
            }).filter((t): t is Transaction => t !== null);

            if (newTransactions.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Import Error",
                    description: "The selected file is empty or does not contain valid data.",
                });
                return;
            }

            setTransactions(prev => [...newTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            toast({
                title: "Import Successful",
                description: `${newTransactions.length} transaction(s) have been imported.`,
            });
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
                if (t.id === editingTransaction.id || (t.description === editingTransaction.description && t.category === 'Uncategorized')) {
                    if (t.category !== finalCategory) {
                        updatedCount++;
                    }
                    return { ...t, category: finalCategory };
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
    };

    const handleCloseDialog = () => {
        setEditingTransaction(null);
        setSelectedCategory('');
        setCustomCategory('');
    }

    const spendingByCategoryChartData = useMemo(() => {
        const spending = transactions
            .filter(t => t.type === 'expense' && t.category !== 'Uncategorized')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = 0;
                }
                acc[t.category] += t.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(spending)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);
    }, [transactions]);


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
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(totalUsage)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(totalPayments)}</p>
                    </CardContent>
                </Card>
            </>
        )}
         <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>A breakdown of your expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
                {spendingByCategoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={spendingByCategoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                            <YAxis 
                                type="category" 
                                dataKey="category" 
                                width={120}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="total" fill="hsl(var(--chart-2))" name="Total Spent" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-60 bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Categorize expense transactions to see the chart</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    {transactions.length > 0 ? (
                        transactions.map(t => (
                            <li key={t.id} className="flex justify-between items-center py-2 border-b">
                                <div className="flex items-center gap-4">
                                     <div>
                                        <p className="font-medium">{t.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(t.date).toLocaleDateString()} - <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.category === 'Uncategorized' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>{t.category}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {formatCurrency(t.type === 'expense' ? -t.amount : t.amount)}
                                    </p>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(t)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))
                    ) : (
                         <li className="text-center text-muted-foreground py-4">No transactions found.</li>
                    )}
                </ul>
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

    
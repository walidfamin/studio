

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, transactions as initialTransactions } from "@/lib/data";
import { Download, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect, useMemo, use, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Transaction, Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parse, isValid } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { SpendingBreakdown } from "@/components/dashboard/spending-breakdown";


function parseFlexibleDate(dateString: string | number): Date | null {
  if (typeof dateString === 'number' && dateString > 0) {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateString * 86400000);
  }
  
  if (typeof dateString === 'string') {
    const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'dd-MMM-yy', 'MM/dd/yyyy'];
    for (const fmt of formats) {
        const parsedDate = parse(dateString, fmt, new Date());
        if (isValid(parsedDate)) {
            return parsedDate;
        }
    }
  }
  
  const fallbackDate = new Date(dateString);
  if (isValid(fallbackDate)) {
      return fallbackDate;
  }

  return null;
}


export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
    const accountId = use(params).accountId;
    const [accountDetails, setAccountDetails] = useState<Account | undefined>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Transaction['category'] | 'Other' | 'Transfer'>('');
    const [customCategory, setCustomCategory] = useState<string>('');
    const [transferToAccount, setTransferToAccount] = useState<string>('');
    const [applyToAll, setApplyToAll] = useState<boolean>(true);

    useEffect(() => {
        const details = accounts.find(a => a.id === accountId);
        setAccountDetails(details);
        if (accountId) {
            const accountTransactions = initialTransactions.filter(t => t.accountId === accountId);
            setTransactions(accountTransactions);
        }
    }, [accountId]);
    
    const { accountBalance, startingBalance, totalInflow, totalOutflow } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { accountBalance: 0, startingBalance: 0, totalInflow: 0, totalOutflow: 0 };
        }

        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const startBalance = sortedTransactions[0].balance ?? 0;
        const endBalance = sortedTransactions[sortedTransactions.length - 1].balance ?? 0;
        
        let inflow = 0;
        let outflow = 0;

        sortedTransactions.forEach(t => {
            if (t.type === 'income') {
                inflow += t.amount;
            } else if (t.type === 'expense') {
                outflow += t.amount;
            }
        });

        return { accountBalance: endBalance, startingBalance: startBalance, totalInflow: inflow, totalOutflow: outflow };
    }, [transactions]);


    if (!accountDetails) {
        return <div className="p-8">Account not found.</div>
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const processData = (data: any[][]) => {
        const importId = `import_${Date.now()}`;
        try {
            if (accountDetails.type === 'Credit Card') {
                processCreditCardStatement(data, importId);
            } else {
                processStandardStatement(data, importId);
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

    const processCreditCardStatement = (data: any[][], importId: string) => {
        const rows = data.slice(1);
        
        const newTransactions = rows.map((row, index) => {
            const originalRowNumber = index + 2;

            if (!row || row.length < 4 || row.every(cell => cell === null || cell === "")) return null;

            const [dateStr, description, crDr, amountStr] = row;
            
            if (!dateStr || !description || crDr === undefined || crDr === null || amountStr === undefined || amountStr === null) {
                console.warn(`Skipping row ${originalRowNumber} due to missing data:`, row);
                return null;
            }

            const date = parseFlexibleDate(String(dateStr));
            if (!date) {
                console.warn(`Invalid date on row ${originalRowNumber}: '${dateStr}'`);
                return null;
            }

            const amount = parseFloat(String(amountStr).replace(/,/g, ''));
            if (isNaN(amount)) {
                console.warn(`Invalid amount on row ${originalRowNumber}: '${amountStr}'`);
                return null;
            }
            
            const descriptionStr = String(description).trim();
            const typeRaw = String(crDr).trim().toUpperCase();
            let type: 'income' | 'expense' = 'expense';
            let category: Transaction['category'] = 'Uncategorized';
            
            if (typeRaw === 'CR' || descriptionStr.toLowerCase().includes('payment received')) {
                type = 'income';
                category = 'Credit Card Payment';
            } else {
                type = 'expense';
            }

            return {
                id: `tx_${Date.now()}_${index}`,
                date: date.toISOString(),
                description: descriptionStr,
                amount: amount,
                type: type,
                category: category,
                accountId: accountId,
                importId: importId,
            };
        }).filter((t): t is Transaction => t !== null);

        if (newTransactions.length === 0) {
            toast({ variant: "destructive", title: "Import Error", description: "The selected file is empty or does not contain valid data." });
            return;
        }

        setTransactions(prev => {
            const nonImported = prev.filter(t => t.importId !== importId);
            const updatedTransactions = [...nonImported, ...newTransactions];
            return updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        toast({ title: "Import Successful", description: `${newTransactions.length} transaction(s) have been imported.` });
    };

    const findHeaderIndex = (headers: string[], possibleNames: string[]): number => {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };

    const processStandardStatement = (data: any[][], importId: string) => {
        const headers = data[0].map(h => String(h).trim());
        const dateIndex = findHeaderIndex(headers, ['Value Date', 'Date', 'Posting Date']);
        const descIndex = findHeaderIndex(headers, ['Description', 'Narrative']);
        const debitIndex = findHeaderIndex(headers, ['Debit', 'Debit Amount']);
        const creditIndex = findHeaderIndex(headers, ['Credit', 'Credit Amount']);
        const balanceIndex = findHeaderIndex(headers, ['Balance']);
        
        if (dateIndex === -1 || descIndex === -1 || debitIndex === -1 || creditIndex === -1 || balanceIndex === -1) {
            throw new Error("Invalid file headers. Could not find required columns for Date, Description, Debit, Credit, and Balance.");
        }

        const rows = data.slice(1);
        const newTransactions = rows.map((row, index) => {
            const originalRowNumber = index + 2;
            if (!row || row.every(cell => cell === null || cell === "")) return null;

            const dateStr = row[dateIndex];
            const description = row[descIndex];
            const debit = row[debitIndex];
            const credit = row[creditIndex];
            const balance = row[balanceIndex];

            if (!dateStr || !description) return null;

            const date = parseFlexibleDate(dateStr);
            if (!date) {
                 console.warn(`Invalid date on row ${originalRowNumber}: '${dateStr}'`);
                 return null;
            }

            const debitAmount = debit ? parseFloat(String(debit).replace(/,/g, '')) : 0;
            const creditAmount = credit ? parseFloat(String(credit).replace(/,/g, '')) : 0;
            const balanceAmount = balance ? parseFloat(String(balance).replace(/,/g, '')) : 0;
            
            if (isNaN(debitAmount) || isNaN(creditAmount) || isNaN(balanceAmount)) {
                console.warn(`Invalid amount on row ${originalRowNumber}.`);
                return null;
            }

            const amount = debitAmount || creditAmount;
            const type = debitAmount > 0 ? 'expense' : 'income';
            
            return {
                id: `tx_${Date.now()}_${index}`,
                date: date.toISOString(),
                description: String(description).trim(),
                amount: amount,
                type: type,
                category: 'Uncategorized',
                accountId: accountId,
                importId: importId,
                balance: balanceAmount,
            } as Transaction;
        }).filter((t): t is Transaction => t !== null);
        
         if (newTransactions.length === 0) {
            toast({ variant: "destructive", title: "Import Error", description: "The selected file is empty or does not contain valid data." });
            return;
        }

        startTransition(() => {
            setTransactions(prev => {
                const nonImported = prev.filter(t => t.importId !== importId);
                const updatedTransactions = [...nonImported, ...newTransactions];
                return updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });
        });
        toast({ title: "Import Successful", description: `${newTransactions.length} transaction(s) have been imported.` });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: file.name.endsWith('.csv') ? 'string' : 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });
                processData(json as any[][]);
            } catch (error) {
                 toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
            }
        };

        reader.onerror = () => {
            toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
        };
        
        if (file.name.endsWith('.csv')) {
             reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleSaveCategory = () => {
        if (!editingTransaction) return;

        let finalCategory: Transaction['category'];
        if (selectedCategory === 'Other') {
            finalCategory = customCategory.trim() as Transaction['category'];
        } else if (selectedCategory === 'Transfer') {
            finalCategory = 'Transfer';
        } else {
            finalCategory = selectedCategory as Transaction['category'];
        }
        
        if (!finalCategory) {
            toast({ variant: "destructive", title: "Category not selected", description: "Please select or enter a category." });
            return;
        }

        if (finalCategory === 'Transfer' && !transferToAccount) {
            toast({ variant: "destructive", title: "Destination account not selected", description: "Please select an account for the transfer." });
            return;
        }

        let updatedCount = 0;
        let transferCreated = false;

        startTransition(() => {
            setTransactions(prev => {
                const newTransactions = prev.map(t => {
                    const isMatchingTransaction = t.id === editingTransaction.id || 
                        (applyToAll && t.description === editingTransaction.description && t.category === 'Uncategorized');

                    if (isMatchingTransaction) {
                        if (t.category !== finalCategory) {
                            updatedCount++;
                        }
                        return { ...t, category: finalCategory };
                    }
                    return t;
                });
                
                // Handle transfer creation
                if (finalCategory === 'Transfer' && transferToAccount) {
                    const transferAmount = editingTransaction.amount;
                    const transferDescription = `Transfer from ${accountDetails.name}`;
                    
                    const transferTransaction: Transaction = {
                        id: `tx_transfer_${Date.now()}`,
                        date: editingTransaction.date,
                        description: transferDescription,
                        amount: transferAmount,
                        type: 'income',
                        category: 'Transfer',
                        accountId: transferToAccount,
                    };

                    initialTransactions.push(transferTransaction);

                    const originalIndex = newTransactions.findIndex(t => t.id === editingTransaction.id);
                    if (originalIndex !== -1) {
                        newTransactions[originalIndex] = { ...newTransactions[originalIndex], type: 'expense' };
                    }

                    transferCreated = true;
                }
                
                return newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });
        });

        handleCloseDialog();
        toast({
            title: "Transactions Updated",
            description: `${updatedCount} transaction(s) have been categorized as "${finalCategory}". ${transferCreated ? 'Transfer created.' : ''}`.trim(),
        });
    };
    
    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setSelectedCategory(transaction.category);
        setCustomCategory('');
        setTransferToAccount('');
        setApplyToAll(true);
    };

    const handleCloseDialog = () => {
        setEditingTransaction(null);
        setSelectedCategory('');
        setCustomCategory('');
        setTransferToAccount('');
    }

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
      
      <div className="grid grid-cols-1 gap-6">
        {accountDetails.type === 'Credit Card' ? (
             <Card>
                <CardHeader>
                    <CardTitle>Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{formatCurrency(accountBalance)}</p>
                </CardContent>
            </Card>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Starting Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(startingBalance)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Ending Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(accountBalance)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Inflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalInflow)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Outflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(totalOutflow)}</p>
                    </CardContent>
                </Card>
            </div>
        )}

        {accountDetails.type !== 'Credit Card' && (
            <div className="lg:col-span-1">
                 <SpendingBreakdown />
            </div>
        )}
      
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>All Transactions</CardTitle>
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
                        <Select onValueChange={(value) => setSelectedCategory(value as any)} defaultValue={selectedCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Transport">Transport</SelectItem>
                                <SelectItem value="Spends">Spends</SelectItem>
                                <SelectItem value="Investment">Investment</SelectItem>
                                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                <SelectItem value="Salary">Salary</SelectItem>
                                <SelectItem value="Rent/Mortgage">Rent/Mortgage</SelectItem>
                                <SelectItem value="Groceries">Groceries</SelectItem>
                                <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
                                <SelectItem value="Transfer">Transfer</SelectItem>
                                <SelectItem value="Other">Other (Custom)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCategory === 'Other' && (
                        <div>
                            <Label htmlFor="custom-category">Custom Category</Label>
                            <Input 
                                id="custom-category" 
                                placeholder="Enter your custom category"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                            />
                        </div>
                    )}
                     {selectedCategory === 'Transfer' && (
                        <div>
                            <Label htmlFor="transfer-account">Transfer to Account</Label>
                            <Select onValueChange={setTransferToAccount} defaultValue={transferToAccount}>
                                <SelectTrigger id="transfer-account">
                                    <SelectValue placeholder="Select destination account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(acc => acc.id !== accountId).map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>{acc.name} - {acc.bank}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

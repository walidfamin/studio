
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, investments, transactions as initialTransactions } from "@/lib/data";
import { Download, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect, useMemo, startTransition, use } from "react";
import { useToast } from "@/hooks/use-toast";
import { Transaction, Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parse, isValid, fromUnixTime } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { SpendingByCategory } from "@/components/reports/spending-by-category";
import { Progress } from "@/components/ui/progress";


function parseFlexibleDate(dateString: string | number): Date | null {
  if (typeof dateString === 'number' && dateString > 0) {
    // Excel's epoch starts on 1899-12-30. The number represents days since then.
    // JS Date epoch is 1970-01-01. The difference is 25569 days.
    // However, Excel incorrectly thinks 1900 was a leap year. So we need to adjust.
    if (dateString < 60) {
      // It's 1900, but Excel thinks it's a leap year.
      dateString = dateString - 1;
    }
    return new Date(Math.round((dateString - 25569) * 86400000));
  }
  
  if (typeof dateString === 'string') {
    // Handle formats like "dd/MM/yyyy" or "dd-MM-yy" etc.
    const flexibleParse = (ds: string) => {
        const parts = ds.split(/[\/\-\.]/);
        if (parts.length === 3) {
            let day, month, year;
            if (parts[2].length === 4) { // yyyy-mm-dd or dd-mm-yyyy
                if (parseInt(parts[0]) > 12) { // dd-mm-yyyy
                    day = parseInt(parts[0]);
                    month = parseInt(parts[1]) - 1;
                    year = parseInt(parts[2]);
                } else { // yyyy-mm-dd (likely) or mm-dd-yyyy
                     year = parseInt(parts[0]);
                     month = parseInt(parts[1]) - 1;
                     day = parseInt(parts[2]);
                }
            } else { // dd-mm-yy
                day = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                year = parseInt(parts[2]) > 70 ? 1900 + parseInt(parts[2]) : 2000 + parseInt(parts[2]);
            }
            const d = new Date(year, month, day);
            if (isValid(d)) return d;
        }
        return null;
    }

    const parsed = flexibleParse(dateString);
    if(parsed) return parsed;
    
    // Fallback for other standard formats
    const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd-MMM-yy', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
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
    const [investmentId, setInvestmentId] = useState<string>('');
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
        const statementTransactions = transactions.filter(t => t.balance !== undefined && t.balance !== null);
        
        if (statementTransactions.length === 0) {
            // Fallback for accounts without balance data (e.g., credit cards)
            let balance = 0;
            let inflow = 0;
            let outflow = 0;
            transactions.forEach(t => {
                if (t.type === 'income' && t.category !== 'Transfer' && t.category !== 'Credit Card Payment') {
                    inflow += t.amount;
                    balance += t.amount;
                } else if (t.type === 'expense' && t.category !== 'Transfer') {
                    outflow += t.amount;
                    balance -= t.amount;
                }
            });
            return { accountBalance: balance, startingBalance: 0, totalInflow: inflow, totalOutflow: outflow };
        }

        const sortedByDate = [...statementTransactions].sort((a, b) => {
            const dateA = parseFlexibleDate(a.date)?.getTime() || 0;
            const dateB = parseFlexibleDate(b.date)?.getTime() || 0;
            return dateA - dateB;
        });

        // The first transaction chronologically holds the starting balance.
        const startBalance = sortedByDate[0].balance ?? 0;
        // The last transaction chronologically holds the ending balance.
        const endBalance = sortedByDate[sortedByDate.length - 1].balance ?? 0;

        let inflow = 0;
        let outflow = 0;

        transactions.forEach(t => {
            if (t.type === 'income' && t.category !== 'Transfer' && t.category !== 'Credit Card Payment') {
                inflow += t.amount;
            } else if (t.type === 'expense' && t.category !== 'Transfer') {
                outflow += t.amount;
            }
        });

        return { accountBalance: endBalance, startingBalance: startBalance, totalInflow: inflow, totalOutflow: outflow };
    }, [transactions]);
    
    const creditCardLimit = 35200;
    const { creditCardBalance, totalLifetimeSpends } = useMemo(() => {
        if (accountDetails?.type !== 'Credit Card') {
            return { creditCardBalance: 0, totalLifetimeSpends: 0 };
        }
        let balance = 0;
        let lifetimeSpends = 0;
        transactions.forEach(t => {
            if (t.type === 'expense') {
                balance += t.amount;
                lifetimeSpends += t.amount;
            } else if (t.type === 'income' && t.category === 'Credit Card Payment') {
                balance -= t.amount;
            }
        });
        return { creditCardBalance: balance, totalLifetimeSpends: lifetimeSpends };
    }, [transactions, accountDetails]);


    if (!accountDetails) {
        return <div className="p-8">Account not found.</div>
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const processData = (data: any[][]) => {
        const importId = `import_${Date.now()}`;
        try {
            processStandardStatement(data, importId);
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

    const findHeaderIndex = (headers: string[], possibleNames: string[]): number => {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };

    const processStandardStatement = (data: any[][], importId: string) => {
        // Assume headers are in the first row
        const headers = data[0].map(h => String(h).trim());
        const dateIndex = findHeaderIndex(headers, ['posting date', 'date']);
        const descIndex = findHeaderIndex(headers, ['description', 'narrative']);
        const debitIndex = findHeaderIndex(headers, ['debit', 'debit amount']);
        const creditIndex = findHeaderIndex(headers, ['credit', 'credit amount']);
        const balanceIndex = findHeaderIndex(headers, ['balance']);
        
        if (dateIndex === -1 || descIndex === -1 || (debitIndex === -1 && creditIndex === -1) || balanceIndex === -1) {
             // Fallback to credit card format if headers don't match
            return processCreditCardStatement(data, importId);
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

            const date = parseFlexibleDate(String(dateStr));
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

            const amount = Math.abs(debitAmount) || Math.abs(creditAmount);
            let type: 'income' | 'expense' = debitAmount > 0 ? 'expense' : 'income';
            
            // Handle cases where credit card payments might be listed as debits in a bank statement
            let category: Transaction['category'] = 'Uncategorized';
            if (accountDetails?.type !== 'Credit Card' && String(description).toLowerCase().includes('credit card payment')) {
                type = 'expense';
                category = 'Credit Card Payment';
            }

            return {
                id: `tx_${Date.now()}_${index}`,
                date: date.toISOString(),
                description: String(description).trim(),
                amount: amount,
                type: type,
                category: category,
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
                // Replace all existing transactions for this account in the global state
                const otherAccountTransactions = initialTransactions.filter(t => t.accountId !== accountId);
                initialTransactions.length = 0; // Clear the array
                initialTransactions.push(...otherAccountTransactions, ...updatedTransactions); // Push new data

                return updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });
        });
        toast({ title: "Import Successful", description: `${newTransactions.length} transaction(s) have been imported.` });
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
            initialTransactions.push(...newTransactions);
            return updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

        if (finalCategory === 'Investment' && !investmentId) {
            toast({ variant: "destructive", title: "Investment not selected", description: "Please select an investment." });
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
                         const updatedTransaction = { ...t, category: finalCategory, investmentId: finalCategory === 'Investment' ? investmentId : undefined };
                        
                         // Also update in the global `initialTransactions`
                         const globalIndex = initialTransactions.findIndex(it => it.id === t.id);
                         if (globalIndex !== -1) {
                            initialTransactions[globalIndex] = updatedTransaction;
                         }

                        return updatedTransaction;
                    }
                    return t;
                });
                
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
        setInvestmentId(transaction.investmentId || '');
        setApplyToAll(true);
    };

    const handleCloseDialog = () => {
        setEditingTransaction(null);
        setSelectedCategory('');
        setCustomCategory('');
        setTransferToAccount('');
        setInvestmentId('');
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
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Card Usage</CardTitle>
                        <CardDescription>Limit: {formatCurrency(creditCardLimit)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(creditCardBalance)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(creditCardLimit - creditCardBalance)} remaining</p>
                        <Progress value={(creditCardBalance / creditCardLimit) * 100} className="mt-2"/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Lifetime Spends</CardTitle>
                        <CardDescription>All expenses on this card.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(totalLifetimeSpends)}</p>
                    </CardContent>
                </Card>
                <div className="col-span-1 md:col-span-2">
                    <SpendingByCategory transactions={transactions} />
                </div>
            </div>
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
                 <div className="lg:col-span-4">
                    <SpendingByCategory transactions={transactions} />
                </div>
            </div>
        )}
      
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                 <TransactionTable transactions={transactions} onEdit={handleEditClick} setTransactions={setTransactions}/>
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
                                {accountDetails?.type === 'Credit Card' ? (
                                    <>
                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                        <SelectItem value="Food">Food</SelectItem>
                                        <SelectItem value="DEWA">DEWA</SelectItem>
                                        <SelectItem value="Etisalat">Etisalat</SelectItem>
                                        <SelectItem value="Du">Du</SelectItem>
                                        <SelectItem value="Travel">Travel</SelectItem>
                                        <SelectItem value="Repair">Repair</SelectItem>
                                        <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="Food">Food</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Spends">Spends</SelectItem>
                                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                        <SelectItem value="Salary">Salary</SelectItem>
                                        <SelectItem value="Rent/Mortgage">Rent/Mortgage</SelectItem>
                                        <SelectItem value="Groceries">Groceries</SelectItem>
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                        <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
                                    </>
                                )}
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
                     {selectedCategory === 'Investment' && (
                        <div>
                            <Label htmlFor="investment">Allocate to Investment</Label>
                            <Select onValueChange={setInvestmentId} defaultValue={investmentId}>
                                <SelectTrigger id="investment">
                                    <SelectValue placeholder="Select an investment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {investments.map(inv => (
                                        <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
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

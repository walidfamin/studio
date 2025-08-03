


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
import { parse, isValid, getYear } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { SpendingByCategory } from "@/components/reports/spending-by-category";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


function parseFlexibleDate(dateInput: string | number | Date): Date | null {
    if (dateInput instanceof Date && isValid(dateInput)) {
        return dateInput;
    }

    if (typeof dateInput === 'string') {
        const parts = dateInput.split(/[-/.]/);
        if (parts.length === 3) {
            let [day, month, year] = parts;

            if (year.length === 2) {
                const intYear = parseInt(year, 10);
                year = (intYear < 50 ? 2000 + intYear : 1900 + intYear).toString();
            }
            
            const normalizedDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const parsed = new Date(normalizedDateStr);
            if (isValid(parsed)) {
                return parsed;
            }
        }
        
        const fallbackDate = new Date(dateInput);
        if (isValid(fallbackDate)) {
            return fallbackDate;
        }
    }

    if (typeof dateInput === 'number' && dateInput > 0) {
        // Excel date (serial number)
        const excelEpoch = new Date('1899-12-30');
        const date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
        
        // Adjust for timezone offset that might be introduced
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        if (isValid(adjustedDate)) {
            return adjustedDate;
        }
    }

    return null;
}

const createTransactionId = (t: Omit<Transaction, 'id'>): string => {
    const datePart = new Date(t.date).toISOString().split('T')[0];
    const amountPart = t.amount.toFixed(2);
    // A simple hash function to avoid overly long IDs
    const descHash = t.description.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `${datePart}_${amountPart}_${t.type}_${descHash}`;
};


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
    const [assignedTo, setAssignedTo] = useState<Transaction['assignedTo']>('Walid');
    const [transactionType, setTransactionType] = useState<Transaction['type']>('expense');
    const [walidShare, setWalidShare] = useState<string>('');


    useEffect(() => {
        const details = accounts.find(a => a.id === accountId);
        setAccountDetails(details);
        if (accountId) {
            const accountTransactions = initialTransactions.filter(t => t.accountId === accountId);
            setTransactions(accountTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [accountId]);
    
    const { accountBalance, startingBalance, totalInflow, totalOutflow } = useMemo(() => {
        const allAccountTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const statementTransactions = allAccountTransactions.filter(t => t.balance !== undefined && t.balance !== null);
        
        let startBalance = 0;
        let finalBalance = 0;

        if (statementTransactions.length > 0) {
            const firstStatementTx = statementTransactions[0];
            const lastStatementTx = statementTransactions[statementTransactions.length - 1];
            
            startBalance = firstStatementTx.balance ?? 0;
            let currentBalance = lastStatementTx.balance ?? 0;

            const transactionsAfterLastStatement = allAccountTransactions.filter(
                t => new Date(t.date) > new Date(lastStatementTx.date)
            );
            
            transactionsAfterLastStatement.forEach(t => {
                 if (t.type === 'income') {
                    currentBalance += t.amount;
                } else if (t.type === 'expense') {
                    currentBalance -= t.amount;
                }
            });
            finalBalance = currentBalance;
        } else {
            // Fallback for accounts without balance data (e.g., manually created)
            let balance = 0;
            allAccountTransactions.forEach(t => {
                if (t.type === 'income') {
                    balance += t.amount;
                } else if (t.type === 'expense') {
                    balance -= t.amount;
                }
            });
            finalBalance = balance;
        }
        
        const inflow = transactions
            .filter(t => t.type === 'income' && t.category !== 'Transfer' && t.category !== 'Credit Card Payment')
            .reduce((sum, t) => sum + t.amount, 0);

        const outflow = transactions
            .filter(t => t.type === 'expense' && t.category !== 'Transfer' && t.category !== 'Credit Card Payment')
            .reduce((sum, t) => sum + t.amount, 0);

        return { accountBalance: finalBalance, startingBalance: startBalance, totalInflow: inflow, totalOutflow: outflow };
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
            } else if (t.type === 'income' || t.type === 'transfer' && (t.category === 'Credit Card Payment' || String(t.description).toLowerCase().includes('payment'))) {
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
        try {
            processCreditCardStatement(data);
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
            const index = headers.findIndex(h => h && h.toLowerCase().includes(name.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    };

    const processCreditCardStatement = (data: any[][]) => {
        const headers = data[0].map(h => String(h).trim());
        const dateIndex = findHeaderIndex(headers, ['posting date', 'date']);
        const descIndex = findHeaderIndex(headers, ['description', 'narrative']);
        const debitIndex = findHeaderIndex(headers, ['debit', 'debit amount']);
        const creditIndex = findHeaderIndex(headers, ['credit', 'credit amount']);
        const balanceIndex = findHeaderIndex(headers, ['balance']);

        if (dateIndex === -1 || descIndex === -1 ) {
             toast({
                variant: "destructive",
                title: "Import Error",
                description: "Could not find required columns: Date, Description. Please use the template."
            });
            return;
        }
        
        let hasAmountCols = debitIndex !== -1 || creditIndex !== -1;
        
        const rows = data.slice(1);
        const newTransactions = rows.map((row, index) => {
            const originalRowNumber = index + 2;
            if (!row || row.every(cell => cell === null || cell === "")) return null;

            const dateStr = row[dateIndex];
            const description = row[descIndex];
            
            if (!dateStr || !description) return null;

            const date = parseFlexibleDate(dateStr);
            if (!date) {
                 console.warn(`Invalid date on row ${originalRowNumber}: '${dateStr}'`);
                 return null;
            }

            let amount = 0;
            let type: Transaction['type'] = 'expense';
            let category: Transaction['category'] = 'Uncategorized';
            let balanceAmount: number | undefined = undefined;

            if (balanceIndex !== -1 && row[balanceIndex] !== null && row[balanceIndex] !== '') {
                balanceAmount = parseFloat(String(row[balanceIndex]).replace(/,/g, ''));
                if (isNaN(balanceAmount)) balanceAmount = undefined;
            }

            if (hasAmountCols) { // Standard statement with Debit/Credit columns
                const debit = row[debitIndex] ? parseFloat(String(row[debitIndex]).replace(/,/g, '')) : 0;
                const credit = row[creditIndex] ? parseFloat(String(row[creditIndex]).replace(/,/g, '')) : 0;
                
                if (isNaN(debit) && isNaN(credit)) {
                    console.warn(`Invalid amount on row ${originalRowNumber}.`);
                    return null;
                }
                amount = Math.abs(debit) || Math.abs(credit);
                type = debit > 0 ? 'expense' : 'income';

            } else { // Credit card specific format
                const crDrIndex = findHeaderIndex(headers, ['cr/dr', 'crdr']);
                const amountIndex = findHeaderIndex(headers, ['amount']);

                if (crDrIndex === -1 || amountIndex === -1) return null; // Should be caught earlier, but for safety

                const typeRaw = String(row[crDrIndex]).trim().toUpperCase();
                const amountRaw = row[amountIndex];

                amount = parseFloat(String(amountRaw).replace(/,/g, ''));
                if (isNaN(amount)) {
                    console.warn(`Invalid amount on row ${originalRowNumber}: '${amountRaw}'`);
                    return null;
                }

                if (typeRaw === 'CR' || String(description).toLowerCase().includes('payment received')) {
                    type = 'income';
                    category = 'Credit Card Payment';
                } else {
                    type = 'expense';
                }
            }
             
             if (accountDetails?.type === 'Credit Card') {
                const lowerDesc = String(description).toLowerCase();
                if (lowerDesc.includes('payment') || lowerDesc.includes('thank you') || lowerDesc.includes('trf')) {
                    category = 'Credit Card Payment';
                    type = 'transfer';
                }
            }


            const transactionData = {
                date: date.toISOString(),
                description: String(description).trim(),
                amount: amount,
                type: type,
                category: category,
                accountId: accountId,
                balance: balanceAmount,
                assignedTo: 'Walid' as 'Walid', // Default assignment
            };

            return {
                ...transactionData,
                id: createTransactionId(transactionData)
            } as Transaction;

        }).filter((t): t is Transaction => t !== null);
        
         if (newTransactions.length === 0) {
            toast({ variant: "destructive", title: "Import Error", description: "The selected file is empty or does not contain valid data." });
            return;
        }

        startTransition(() => {
            const newTransactionIds = new Set(newTransactions.map(t => t.id));
            
            // Update local state for the current account page
            setTransactions(prev => {
                const existingWithoutNew = prev.filter(t => !newTransactionIds.has(t.id));
                const updated = [...existingWithoutNew, ...newTransactions];
                return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });

            // Update global state, ensuring no duplicates across all accounts
            const otherAccountTransactions = initialTransactions.filter(t => t.accountId !== accountId);
            const thisAccountTransactions = initialTransactions.filter(t => t.accountId === accountId);
            const existingThisAccountWithoutNew = thisAccountTransactions.filter(t => !newTransactionIds.has(t.id));

            initialTransactions.length = 0; // Clear the array
            initialTransactions.push(...otherAccountTransactions, ...existingThisAccountWithoutNew, ...newTransactions);
        });

        toast({ title: "Import Successful", description: `${newTransactions.length} transaction(s) have been imported or updated.` });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
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
        
        reader.readAsArrayBuffer(file);
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
            const updateLogic = (t: Transaction): Transaction => {
                const isMatchingTransaction = t.id === editingTransaction.id || 
                    (applyToAll && t.description === editingTransaction.description && t.category === 'Uncategorized');

                if (isMatchingTransaction) {
                    if (t.category !== finalCategory || t.assignedTo !== assignedTo || t.type !== transactionType) {
                        updatedCount++;
                    }
                    return { 
                        ...t, 
                        type: transactionType,
                        category: finalCategory,
                        assignedTo: assignedTo,
                        investmentId: finalCategory === 'Investment' ? investmentId : undefined,
                        walidShare: transactionType === 'income' ? parseFloat(walidShare) || undefined : undefined
                    };
                }
                return t;
            };

            setTransactions(prev => {
                const newTransactions = prev.map(updateLogic);

                if (finalCategory === 'Transfer' && transferToAccount) {
                    const transferAmount = editingTransaction.amount;
                    const transferDescription = `Transfer from ${accountDetails.name}`;
                    
                    const transferTransactionData = {
                        date: editingTransaction.date,
                        description: transferDescription,
                        amount: transferAmount,
                        type: 'income' as 'income',
                        category: 'Transfer' as 'Transfer',
                        accountId: transferToAccount,
                        assignedTo: assignedTo,
                    };

                    const transferTransaction: Transaction = {
                        ...transferTransactionData,
                        id: createTransactionId(transferTransactionData)
                    };
                    initialTransactions.push(transferTransaction);
                    transferCreated = true;
                }
                
                return newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });

            // Also update in the global `initialTransactions`
            const globalIndices = initialTransactions.map((t, i) => i);
            for(const i of globalIndices) {
                initialTransactions[i] = updateLogic(initialTransactions[i]);
            }
        });

        handleCloseDialog();
        toast({
            title: "Transactions Updated",
            description: `${updatedCount} transaction(s) have been updated. ${transferCreated ? 'Transfer created.' : ''}`.trim(),
        });
    };
    
    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setSelectedCategory(transaction.category);
        setTransactionType(transaction.type);
        setCustomCategory('');
        setTransferToAccount('');
        setInvestmentId(transaction.investmentId || '');
        setApplyToAll(true);
        setAssignedTo(transaction.assignedTo || 'Walid');
        setWalidShare(transaction.walidShare?.toString() || '');
    };

    const handleCloseDialog = () => {
        setEditingTransaction(null);
        setSelectedCategory('');
        setCustomCategory('');
        setTransferToAccount('');
        setInvestmentId('');
        setAssignedTo('Walid');
        setWalidShare('');
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
                        <Label>Transaction Type</Label>
                         <RadioGroup
                            onValueChange={(v) => setTransactionType(v as any)}
                            defaultValue={transactionType}
                            className="flex gap-4 mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="expense" id="r-expense" />
                                <Label htmlFor="r-expense" className="font-normal">Expense</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="income" id="r-income" />
                                <Label htmlFor="r-income" className="font-normal">Income</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="transfer" id="r-transfer" />
                                <Label htmlFor="r-transfer" className="font-normal">Transfer</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {transactionType === 'income' && (
                        <div>
                            <Label htmlFor="walid-share">Walid's Share (AED)</Label>
                            <Input 
                                id="walid-share" 
                                type="number"
                                placeholder={`e.g., portion of ${formatCurrency(editingTransaction?.amount || 0)}`}
                                value={walidShare}
                                onChange={(e) => setWalidShare(e.target.value)}
                            />
                        </div>
                    )}
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
                    <div>
                        <Label htmlFor="assigned-to">Assigned To</Label>
                        <Select onValueChange={(v) => setAssignedTo(v as any)} defaultValue={assignedTo}>
                            <SelectTrigger id="assigned-to">
                                <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Walid">Walid</SelectItem>
                                <SelectItem value="Nathalie">Nathalie</SelectItem>
                                <SelectItem value="Company">Company</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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

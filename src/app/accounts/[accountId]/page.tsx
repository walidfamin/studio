'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, transactions as initialTransactions } from "@/lib/data";
import { Download, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from 'xlsx';

export default function AccountDetailPage() {
    const params = useParams();
    const accountId = params.accountId as string;
    const account = accounts.find(a => a.id === accountId);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (accountId) {
            // Filter initial transactions for the current account
            const accountTransactions = initialTransactions.filter(t => t.accountId === accountId);
            setTransactions(accountTransactions);
        }
    }, [accountId]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    if (!account) {
        return <div className="p-8">Account not found.</div>
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const processData = (data: any[][]) => {
        try {
            // Remove header row
            const rows = data.slice(1);
            
            const newTransactions: Transaction[] = rows.map((row, index) => {
                if (!row || row.length < 4 || row.every(cell => cell === null || cell === "")) {
                    console.warn(`Skipping empty or invalid row ${index + 2}:`, row);
                    return null;
                }

                const [dateStr, description, crDr, amountStr] = row;
                
                if (!dateStr || !description || !crDr || !amountStr) {
                    throw new Error(`Invalid data on row ${index + 2}: Each row must have at least 4 values. Found: ${row.join(', ')}`);
                }

                let date;
                if (typeof dateStr === 'number') {
                    // Handle Excel's serial date number
                    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                    date = new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
                } else {
                    date = new Date(dateStr);
                }

                if (isNaN(date.getTime())) {
                    throw new Error(`Invalid date on row ${index + 2}: '${dateStr}'`);
                }

                const amount = parseFloat(amountStr);
                if (isNaN(amount)) {
                    throw new Error(`Invalid amount on row ${index + 2}: '${amountStr}' is not a valid number.`);
                }
                
                return {
                    id: `imported_${Date.now()}_${index}`,
                    date: date.toISOString(),
                    description: String(description).trim(),
                    amount: amount,
                    type: String(crDr).trim().toUpperCase() === 'CR' ? 'income' : 'expense',
                    category: 'Uncategorized',
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

        if (file.name.endsWith('.csv')) {
             reader.onload = (e) => {
                const text = e.target?.result as string;
                const workbook = XLSX.read(text, { type: 'string' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                processData(json as any[][]);
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                processData(json as any[][]);
            };
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


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">{account.name}</h1>
            <p className="text-lg text-muted-foreground">{account.bank}</p>
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
      
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{formatCurrency(account.balance)}</p>
            </CardContent>
        </Card>
         <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Payment History (Chart Placeholder)</CardTitle>
                <CardDescription>A chart showing payment history will be displayed here.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-60 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Chart coming soon</p>
                </div>
            </CardContent>
        </Card>

        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    {transactions.length > 0 ? (
                        transactions.map(t => (
                            <li key={t.id} className="flex justify-between items-center py-2 border-b">
                                <div>
                                    <p className="font-medium">{t.description}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>

                                </div>
                                <p className={`font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(t.type === 'expense' ? -t.amount : t.amount)}
                                </p>
                            </li>
                        ))
                    ) : (
                         <li className="text-center text-muted-foreground py-4">No transactions found.</li>
                    )}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

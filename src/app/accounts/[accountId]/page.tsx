
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

export default function AccountDetailPage() {
    const params = useParams();
    const accountId = params.accountId as string;
    const account = accounts.find(a => a.id === accountId);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (accountId) {
            setTransactions(initialTransactions.filter(t => t.accountId === accountId));
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                try {
                    const lines = text.split('\n').slice(1); // Skip header row
                    const newTransactions: Transaction[] = lines.map((line, index) => {
                        const [date, description, amountStr, type, category] = line.split(',');
                        if (!date || !description || !amountStr || !type || !category) {
                            throw new Error(`Invalid data on line ${index + 2}`);
                        }
                        const amount = parseFloat(amountStr);
                        if (isNaN(amount)) {
                             throw new Error(`Invalid amount on line ${index + 2}`);
                        }
                        return {
                            id: `imported_${Date.now()}_${index}`,
                            date: new Date(date.trim()).toISOString(),
                            description: description.trim(),
                            amount: amount,
                            type: type.trim() as 'income' | 'expense',
                            category: category.trim(),
                            accountId: accountId,
                        };
                    }).filter(t => t.description); // Filter out empty lines

                    if (newTransactions.length === 0) {
                        toast({
                            variant: "destructive",
                            title: "Import Error",
                            description: "The selected file is empty or in an invalid format.",
                        });
                        return;
                    }

                    setTransactions(prev => [...newTransactions, ...prev]);
                    toast({
                        title: "Import Successful",
                        description: `${newTransactions.length} transaction(s) have been imported.`,
                    });
                } catch (error: any) {
                     toast({
                        variant: "destructive",
                        title: "Import Failed",
                        description: error.message || "An unexpected error occurred during import.",
                    });
                }
            };
            reader.readAsText(file);
        }
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
                accept=".csv"
            />
            <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4"/> Import</Button>
            <Button variant="outline" asChild>
                <Link href="/transactions-template.csv" download>
                    <Download className="mr-2 h-4 w-4"/> Export
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
                    {transactions.map(t => (
                        <li key={t.id} className="flex justify-between items-center py-2 border-b">
                            <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <p className={`font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(t.type === 'expense' ? -t.amount : t.amount)}
                            </p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

      </div>

    </div>
  )
}

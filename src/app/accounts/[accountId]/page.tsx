'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, transactions } from "@/lib/data";
import { Download, Upload } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
    const { accountId } = params;
    const account = accounts.find(a => a.id === accountId);
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
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
            // Here you would typically handle the file upload and parsing.
            // For now, we'll just show a toast notification.
            toast({
                title: "File Selected",
                description: `${file.name} is ready for import.`,
            });
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
                <p className="text-4xl font-bold">{account.balance.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</p>
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
                    {accountTransactions.map(t => (
                        <li key={t.id} className="flex justify-between items-center py-2 border-b">
                            <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <p className={`font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}
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

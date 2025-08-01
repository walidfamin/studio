
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accounts, transactions } from "@/lib/data";
import { Download, Upload } from "lucide-react";

export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
    const account = accounts.find(a => a.id === params.accountId);
    const accountTransactions = transactions.filter(t => t.accountId === params.accountId);

    if (!account) {
        return <div className="p-8">Account not found.</div>
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">{account.name}</h1>
            <p className="text-lg text-muted-foreground">{account.bank}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Import</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export</Button>
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

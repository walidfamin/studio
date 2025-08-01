import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Landmark, Wallet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AccountOverview() {
  const accounts = [
    { name: 'Checking', balance: 4850.75 },
    { name: 'Savings', balance: 12345.67 },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-accent" />
            Account Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.name} className="flex items-center justify-between">
              <p className="text-sm font-medium">{account.name}</p>
              <p className="text-sm font-semibold">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-bold">
            <p>Total Balance</p>
            <p>${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

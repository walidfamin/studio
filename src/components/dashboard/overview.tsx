import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Landmark, Wallet, CreditCard, PiggyBank, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { accounts } from '@/lib/data';
import { Button } from '../ui/button';

const accountIcons = {
  bank: <Landmark className="w-5 h-5 text-accent" />,
  credit: <CreditCard className="w-5 h-5 text-accent" />,
  investment: <PiggyBank className="w-5 h-5 text-accent" />,
}

export function AccountOverview() {
  const totalBalance = accounts.reduce((sum, acc) => acc.type !== 'credit' ? sum + acc.balance : sum, 0);

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent" />
            Accounts
          </CardTitle>
          <CardDescription>All your connected accounts.</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          <PlusCircle className="mr-2"/>
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {accountIcons[account.type]}
                <p className="text-sm font-medium">{account.name}</p>
              </div>
              <p className="text-sm font-semibold">{account.balance.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</p>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-bold text-lg">
            <p>Total Net Worth</p>
            <p>{totalBalance.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

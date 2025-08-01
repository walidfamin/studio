
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Landmark, Wallet, CreditCard, PiggyBank, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { accounts, transactions } from '@/lib/data';
import { Button } from '../ui/button';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export function AccountOverview() {
  const totalNetWorth = accounts.reduce((sum, account) => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const balance = accountTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + t.amount;
        if (t.type === 'expense') return acc - t.amount;
        return acc;
    }, 0);
    return sum + balance;
  }, 0);

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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/accounts/new">
            <PlusCircle className="mr-2"/>
            Add Account
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const balance = transactions.filter(t => t.accountId === account.id).reduce((acc, t) => {
                if (t.type === 'income') return acc + t.amount;
                if (t.type === 'expense') return acc - t.amount;
                return acc;
            }, 0);

            return (
                 <Link href={`/accounts/${account.id}`} key={account.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Image src={`https://logo.clearbit.com/${account.bank.split(' ')[0].toLowerCase()}.com`} alt={account.bank} width={20} height={20} className="rounded-full" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                        <p className="text-sm font-medium">{account.name}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(balance)}</p>
                </Link>
            )
          })}
          <Separator />
          <div className="flex items-center justify-between font-bold text-lg">
            <p>Total Net Worth</p>
            <p>{formatCurrency(totalNetWorth)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

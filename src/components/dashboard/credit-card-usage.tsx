
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { CreditCard } from 'lucide-react';
import { useMemo } from 'react';

export function CreditCardUsage() {
  const limit = 35200;
  
  const spent = useMemo(() => {
    return transactions
        .filter(t => t.accountId.includes('credit')) // A simple way to identify credit card transactions
        .reduce((sum, t) => {
            if (t.type === 'expense') return sum + t.amount;
            if (t.type === 'income') return sum - t.amount;
            return sum;
        }, 0);
  }, [transactions]);
  
  const progressValue = (spent / limit) * 100;

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-accent" />
          Credit Card
        </CardTitle>
        <CardDescription>Limit: {formatCurrency(limit)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(spent)} spent</div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(limit - spent)} remaining
        </p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <Progress value={progressValue} aria-label={`${progressValue.toFixed(2)}% of credit limit used`} />
        <p className="text-sm text-muted-foreground">Next payment due: July 25, 2024</p>
      </CardFooter>
    </Card>
  );
}

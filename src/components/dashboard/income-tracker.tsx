
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export function IncomeTracker() {

  const totalIncome = useMemo(() => {
    return transactions
        .filter(t => t.type === 'income' && t.category !== 'Credit Card Payment')
        .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-headline">Total Income</CardTitle>
        <TrendingUp className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(totalIncome)}</div>
        <p className="text-xs text-muted-foreground">
          Across all accounts
        </p>
      </CardContent>
    </Card>
  );
}

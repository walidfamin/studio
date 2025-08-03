'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '../ui/progress';
import { transactions } from '@/lib/data';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function RecurringExpenses() {
  const recurring = useMemo(() => {
    const now = new Date();
    const thisMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

    const expensesThisMonth = transactions.filter(t => {
        if (t.type !== 'expense') return false;
        try {
            const transactionDate = parseISO(t.date);
            return isWithinInterval(transactionDate, interval);
        } catch (e) {
            return false;
        }
    });

    const rent = expensesThisMonth
        .filter(t => t.category === 'Rent/Mortgage')
        .reduce((sum, t) => sum + t.amount, 0);

    const utilities = expensesThisMonth
        .filter(t => ['DEWA', 'Du', 'Etisalat'].includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);

    // Using arbitrary goals for progress bar visualization
    const rentGoal = 5000; 
    const utilitiesGoal = 500;

    return [
      { name: 'Rent', amount: rent, progress: (rent / rentGoal) * 100 },
      { name: 'Utilities', amount: utilities, progress: (utilities / utilitiesGoal) * 100 },
    ];
  }, [transactions]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recurring Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {recurring.map(item => (
                <div key={item.name}>
                    <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.amount)}</span>
                    </div>
                    <Progress value={item.progress} />
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

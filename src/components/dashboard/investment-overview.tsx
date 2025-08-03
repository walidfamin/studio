
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { investments } from '@/lib/data';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '../ui/button';

export function InvestmentOverview({ transactions }: { transactions: Transaction[] }) {
  const investmentData = useMemo(() => {
    return investments.map(investment => {
      const totalPaid = transactions
        .filter(t => t.investmentId === investment.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...investment,
        totalPaid,
        // Assuming some placeholder total value for progress calculation
        totalValue: totalPaid * 1.5,
      };
    });
  }, [investments, transactions]);

  const totalInvested = investmentData.reduce((sum, inv) => sum + inv.totalPaid, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-headline">
            Investments Overview
        </CardTitle>
        <CardDescription>Total Invested: {formatCurrency(totalInvested)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {investmentData.map(inv => (
          <div key={inv.id}>
             <div className="flex justify-between items-center mb-1">
              <Link href={`/investments/${inv.id}`}>
                <span className="font-medium hover:underline">{inv.name}</span>
              </Link>
              <span className="text-sm font-semibold">{formatCurrency(inv.totalPaid)}</span>
            </div>
            <Progress value={inv.totalValue > 0 ? (inv.totalPaid / inv.totalValue) * 100 : 0} />
          </div>
        ))}
         {investmentData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No investment payments have been allocated yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

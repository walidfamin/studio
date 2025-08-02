
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
import { investments } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Landmark, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '../ui/button';

export function InvestmentOverview() {
  const { totalValue, totalPaid } = useMemo(() => {
    const totalValue = investments.reduce((sum, prop) => sum + prop.totalValue, 0);
    // downPayment is the initial investment. paymentsMade includes the downpayment initially.
    const totalPaid = investments.reduce((sum, prop) => sum + prop.paymentsMade, 0);
    return { totalValue, totalPaid };
  }, [investments]);

  const progressValue = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Landmark className="w-5 h-5 text-accent" />
            Investment Portfolio
        </CardTitle>
        <CardDescription>A summary of your total investments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
        </div>
        <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% of investments paid`} />
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild>
          <Link href="/investments">View All Investments</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

export function CumulativeSavings({ transactions }: { transactions: Transaction[] }) {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { savings: number; date: Date }> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { date, savings: 0 };
      }

      if (t.type === 'income' && t.category !== 'Credit Card Payment' && t.category !== 'Transfer') {
        monthlyData[monthKey].savings += t.amount;
      } else if (t.type === 'expense' && t.category !== 'Investment' && t.category !== 'Credit Card Payment' && t.category !== 'Transfer') {
        monthlyData[monthKey].savings -= t.amount;
      }
    });

    const sortedMonths = Object.values(monthlyData).sort((a,b) => a.date.getTime() - b.date.getTime());
    
    let cumulativeSaving = 0;
    return sortedMonths.map(data => {
        cumulativeSaving += data.savings;
        return {
            month: data.date.toLocaleString('default', { month: 'short' }),
            savings: cumulativeSaving,
        }
    });
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Cumulative Savings</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="w-full h-48">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
              />
              <Area type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorSavings)" name="Savings" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

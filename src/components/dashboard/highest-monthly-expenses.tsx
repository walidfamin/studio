'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
import { transactions } from '@/lib/data';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

export function HighestMonthlyExpenses() {
  const chartData = useMemo(() => {
    const monthlyExpenses: Record<string, { expenses: number, date: Date }> = {};
    transactions.forEach(t => {
      if (t.type === 'expense' && t.category !== 'Investment') {
        const date = new Date(t.date);
        const monthKey = date.toISOString().slice(0, 7);
        if (!monthlyExpenses[monthKey]) {
          monthlyExpenses[monthKey] = { expenses: 0, date };
        }
        monthlyExpenses[monthKey].expenses += t.amount;
      }
    });

    return Object.entries(monthlyExpenses)
      .map(([key, value]) => ({
        month: value.date.toLocaleString('default', { month: 'short' }),
        expenses: value.expenses,
      }))
      .sort((a,b) => new Date(a.month + ' 1, 2023').getTime() - new Date(b.month + ' 1, 2023').getTime())
      .slice(-6);

  }, [transactions]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Highest Single Month Expenses</CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ChartContainer config={{}} className="w-full h-full">
           <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} hide/>
                    <Tooltip 
                        cursor={{fill: 'hsla(var(--primary), 0.1)'}}
                        content={<ChartTooltipContent formatter={(value) => formatCurrency(value)} />} 
                    />
                    <Bar dataKey="expenses" fill="hsl(var(--primary), 0.5)" radius={[4, 4, 0, 0]}>
                       {/* You can add logic here to highlight the highest bar if desired */}
                    </Bar>
                </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

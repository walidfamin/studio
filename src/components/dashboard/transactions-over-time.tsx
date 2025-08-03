
'use client';

import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
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


export function TransactionsOverTime({ transactions }: { transactions: Transaction[] }) {

  const chartData = useMemo(() => {
     const monthlyData: Record<string, { income: number; expenses: number; date: Date }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            if (!monthlyData[monthKey]) {
                 monthlyData[monthKey] = { date, income: 0, expenses: 0 };
            }

            if (t.type === 'income' && t.category !== 'Credit Card Payment' && t.category !== 'Transfer') {
                monthlyData[monthKey].income += t.amount;
            } else if (t.type === 'expense' && t.category !== 'Investment' && t.category !== 'Credit Card Payment' && t.category !== 'Transfer') {
                monthlyData[monthKey].expenses += t.amount;
            }
        });

        const sortedMonths = Object.values(monthlyData).sort((a,b) => a.date.getTime() - b.date.getTime());
        
        return sortedMonths.map(data => ({
            month: data.date.toLocaleString('default', { month: 'short' }),
            income: data.income,
            expenses: data.expenses,
        }));
  }, [transactions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Income vs. Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[200px] w-full">
           <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k`} hide />
              <Tooltip content={<ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Income" dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Expenses" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

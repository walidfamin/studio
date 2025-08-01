
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
import { transactions } from '@/lib/data';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';


export function TransactionsOverTime() {

  const chartData = useMemo(() => {
     const monthlyData: Record<string, { income: number; expenses: number; date: Date }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            if (!monthlyData[monthKey]) {
                 monthlyData[monthKey] = { date, income: 0, expenses: 0 };
            }

            if (t.type === 'income' && t.category !== 'Credit Card Payment') {
                monthlyData[monthKey].income += t.amount;
            } else if (t.type === 'expense') {
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
        <CardTitle className="font-headline">Cash Flow</CardTitle>
        <CardDescription>Income vs. Expenses over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[200px] w-full">
           <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k AED`} />
              <Tooltip content={<ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />} />
              <Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} name="Income" />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} name="Expenses"/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

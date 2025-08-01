
'use client';

import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { transactions } from '@/lib/data';
import React from 'react';
import { formatCurrency } from '@/lib/utils';


export function SpendingBreakdown() {
  const chartData = React.useMemo(() => {
     const spending = transactions
            .filter(t => t.type === 'expense' && t.category !== 'Uncategorized' && t.category !== 'Credit Card Payment')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = { value: 0, fill: `hsl(var(--chart-${(Object.keys(acc).length % 5) + 1}))`};
                }
                acc[t.category].value += t.amount;
                return acc;
            }, {} as Record<string, { value: number, fill: string }>);
        
    return Object.entries(spending).map(([category, data]) => ({ category, ...data }));
  }, [transactions]);
  
  const chartConfig = React.useMemo(() => ({
      spending: {
        label: 'Spending',
      },
      ...chartData.reduce((acc, cur) => {
        acc[cur.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')] = { label: cur.category, color: cur.fill };
        return acc;
      }, {} as ChartConfig)
  }), [chartData]) satisfies ChartConfig;

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="h-full flex flex-col">
       <CardHeader>
        <CardTitle className="font-headline">Spending Breakdown</CardTitle>
        <CardDescription>A look at your spending by category.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0 pt-6">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart accessibilityLayer>
                    <Tooltip 
                        cursor={false}
                        content={
                        <ChartTooltipContent
                            hideLabel
                            formatter={(value: number, name, props) => {
                            return (
                                <div className='flex flex-col items-center'>
                                <span className='text-muted-foreground'>{props.payload.category}</span>
                                <span className='font-bold'>{formatCurrency(value)}</span>
                                </div>
                            )
                            }}
                        />
                        } 
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={80}
                        strokeWidth={5}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          ) : (
             <div className="h-52 bg-muted rounded-md flex items-center justify-center text-center p-4">
                <p className="text-muted-foreground">Categorize your expense transactions to see a spending breakdown.</p>
            </div>
          )}
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-1 font-medium leading-none">
            Total Expenses
        </div>
        <div className="leading-none text-2xl font-bold">
            {formatCurrency(totalValue)}
        </div>
      </CardFooter>
    </Card>
  );
}

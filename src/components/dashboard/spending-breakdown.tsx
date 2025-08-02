

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';


export function SpendingBreakdown() {
  const [period, setPeriod] = React.useState('monthly');
  
  const chartData = React.useMemo(() => {
     const now = new Date();
     let interval;
     switch (period) {
        case 'weekly':
            // Simplified for brevity, you'd use startOfWeek/endOfWeek from date-fns
            const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
            const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            interval = { start: firstDay, end: lastDay };
            break;
        case 'monthly':
        default:
            interval = { start: startOfMonth(now), end: endOfMonth(now) };
            break;
     }
     
     const filteredTransactions = transactions.filter(t => {
        try {
            const transactionDate = parseISO(t.date);
            return isWithinInterval(transactionDate, interval);
        } catch (e) {
            return false;
        }
    });

     const spending = filteredTransactions
            .filter(t => t.type === 'expense' && t.category !== 'Uncategorized' && t.category !== 'Credit Card Payment' && t.category !== 'Transfer')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = { value: 0, fill: `hsl(var(--chart-${(Object.keys(acc).length % 5) + 1}))`};
                }
                acc[t.category].value += t.amount;
                return acc;
            }, {} as Record<string, { value: number, fill: string }>);
        
    return Object.entries(spending).map(([category, data]) => ({ category, ...data }));
  }, [transactions, period]);
  
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
       <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Spending Breakdown</CardTitle>
            <CardDescription>Spending for this month.</CardDescription>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                   {period.charAt(0).toUpperCase() + period.slice(1)} <ChevronDown className="ml-2 h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setPeriod('monthly')}>Monthly</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPeriod('weekly')}>Weekly</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0 pt-6">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-[300px]">
                <ResponsiveContainer width="100%" height={250}>
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
                        outerRadius={100}
                        strokeWidth={5}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            const category = chartData[index].category;

                            return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                                    {category} ({(percent * 100).toFixed(0)}%)
                                </text>
                            );
                        }}
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
                <p className="text-muted-foreground">Categorize expense transactions to see the chart.</p>
            </div>
          )}
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm mt-4">
        <div className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2">
            {chartData.map(item => (
                <div key={item.category} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></span>
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}

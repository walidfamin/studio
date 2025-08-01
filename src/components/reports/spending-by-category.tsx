
'use client';

import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { ChevronDown } from 'lucide-react';

type Period = 'weekly' | 'monthly' | 'yearly';

const filterTransactionsByPeriod = (transactions: Transaction[], period: Period): Transaction[] => {
    const now = new Date();
    let interval: Interval;

    switch (period) {
        case 'weekly':
            interval = { start: startOfWeek(now), end: endOfWeek(now) };
            break;
        case 'monthly':
            interval = { start: startOfMonth(now), end: endOfMonth(now) };
            break;
        case 'yearly':
            interval = { start: startOfYear(now), end: endOfYear(now) };
            break;
        default:
            interval = { start: startOfMonth(now), end: endOfMonth(now) };
    }
    
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, interval);
    });
};


export function SpendingByCategory({ transactions }: { transactions: Transaction[] }) {
    const [period, setPeriod] = useState<Period>('monthly');

    const chartData = useMemo(() => {
        const filteredTransactions = filterTransactionsByPeriod(transactions, period);
        
        const spending = filteredTransactions
            .filter(t => t.type === 'expense' && t.category !== 'Uncategorized')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = 0;
                }
                acc[t.category] += t.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(spending)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);

    }, [transactions, period]);

    const totalSpending = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.total, 0);
    }, [chartData]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Spending by Category</CardTitle>
                    <CardDescription>
                        Total spending for each category this {period.slice(0, -2)}. Total: {formatCurrency(totalSpending)}
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                           {period.charAt(0).toUpperCase() + period.slice(1)} <ChevronDown className="ml-2 h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setPeriod('weekly')}>Weekly</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPeriod('monthly')}>Monthly</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPeriod('yearly')}>Yearly</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                            <YAxis 
                                type="category" 
                                dataKey="category" 
                                width={120}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Spent" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-72 bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">No spending data for this period. Categorize transactions to see the chart.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


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
import { spendingData } from '@/lib/data';


export function TransactionsOverTime() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Cash Flow</CardTitle>
        <CardDescription>Income vs. Expenses - Last 7 Months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="min-h-[200px] w-full">
           <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={spendingData}
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
              <Tooltip content={<ChartTooltipContent formatter={(value: number) => value.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })} />} />
              <Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

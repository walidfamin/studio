'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';
import { spendingData } from '@/lib/data';

export function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Spending Breakdown</CardTitle>
        <CardDescription>July 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="lifestyle" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="investment" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spends" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

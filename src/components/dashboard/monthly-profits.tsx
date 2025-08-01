
'use client';

import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';

const chartData = [
  { source: 'Shopify', profit: 38672, fill: 'hsl(var(--chart-1))' },
  { source: 'Gumroad', profit: 22101, fill: 'hsl(var(--chart-2))' },
  { source: 'Courses', profit: 17483, fill: 'hsl(var(--chart-3))' },
]

const chartConfig = {
  profit: {
    label: 'Profit',
  },
  ...chartData.reduce((acc, cur) => {
    acc[cur.source.toLowerCase()] = { label: cur.source, color: cur.fill };
    return acc;
  }, {} as ChartConfig)
} satisfies ChartConfig;

export function MonthlyProfits() {
  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.profit, 0);
  }, []);

  return (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="font-headline">Monthly Profits</CardTitle>
            <Button variant="ghost" size="icon">
                <MoreHorizontal />
            </Button>
        </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-0 pt-6">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-[200px]">
            <PieChart accessibilityLayer>
              <Tooltip 
                cursor={false}
                content={<ChartTooltipContent hideLabel />} 
              />
              <Pie
                data={chartData}
                dataKey="profit"
                nameKey="source"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={5}
              >
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex items-center justify-center text-2xl font-bold mt-[-3.5rem] mb-4">
            {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex w-full justify-around">
            {chartData.map(item => (
                <div key={item.source} className="text-center">
                    <p className="text-muted-foreground flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></span>{item.source}</p>
                    <p className="font-bold">{item.profit.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}

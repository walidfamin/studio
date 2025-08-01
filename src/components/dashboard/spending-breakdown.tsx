
'use client';

import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { categorySpending } from '@/lib/data';
import React from 'react';

const chartConfig = {
  spending: {
    label: 'Spending',
  },
  ...categorySpending.reduce((acc, cur) => {
    acc[cur.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')] = { label: cur.category, color: cur.fill };
    return acc;
  }, {} as ChartConfig)
} satisfies ChartConfig;

export function SpendingBreakdown() {
  const totalValue = React.useMemo(() => {
    return categorySpending.reduce((acc, curr) => acc + curr.value, 0);
  }, []);

  return (
    <Card className="h-full flex flex-col">
       <CardHeader>
        <CardTitle className="font-headline">Spending Breakdown</CardTitle>
        <CardDescription>A look at your spending by category.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0 pt-6">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-[200px]">
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
                          <span className='font-bold'>{value.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</span>
                        </div>
                      )
                    }}
                  />
                } 
              />
              <Pie
                data={categorySpending}
                dataKey="value"
                nameKey="category"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={5}
              >
                 {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-1 font-medium leading-none">
            Monthly
        </div>
        <div className="leading-none text-2xl font-bold">
            {totalValue.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}
        </div>
      </CardFooter>
    </Card>
  );
}

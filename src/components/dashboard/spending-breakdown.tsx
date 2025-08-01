'use client';

import { Pie, PieChart, Cell } from 'recharts';
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
import { Badge } from '../ui/badge';
import React from 'react';

const chartConfig = {
  spending: {
    label: 'Spending',
  },
  ...categorySpending.reduce((acc, cur) => {
    acc[cur.category.toLowerCase().replace(/ & /g, '_')] = { label: cur.category, color: cur.fill };
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
        <CardTitle className="font-headline">Spending by Category</CardTitle>
        <CardDescription>July 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0">
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-[250px]">
            <PieChart accessibilityLayer>
              <Pie
                data={categorySpending}
                dataKey="value"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                 {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-1 font-medium leading-none">
            Total spent: ${totalValue.toLocaleString()}
        </div>
        <div className="leading-none text-muted-foreground flex flex-wrap justify-center gap-1">
          {categorySpending.map(item => (
            <Badge key={item.category} variant="outline" style={{borderColor: item.fill}}>
                {item.category}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

'use client';

import { Bar, BarChart, Tooltip } from 'recharts';
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
  type ChartConfig,
} from '@/components/ui/chart';
import { spendingData } from '@/lib/data';

const chartConfig = {
  lifestyle: {
    label: 'Lifestyle',
    color: 'hsl(var(--chart-1))',
  },
  investment: {
    label: 'Investment',
    color: 'hsl(var(--chart-2))',
  },
  spends: {
    label: 'Spends',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Spending Breakdown</CardTitle>
        <CardDescription>July 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={spendingData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="lifestyle"
                stackId="a"
                fill="var(--color-lifestyle)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="investment"
                stackId="a"
                fill="var(--color-investment)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="spends"
                stackId="a"
                fill="var(--color-spends)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

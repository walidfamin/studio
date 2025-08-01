
'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';


const chartData = [
  { month: 'May', thisMonth: 8000, lastMonth: 7500 },
  { month: 'Jun', thisMonth: 12000, lastMonth: 11000 },
  { month: 'Jul', thisMonth: 5000, lastMonth: 9000 },
  { month: 'Aug', thisMonth: 15000, lastMonth: 14000 },
  { month: 'Sep', thisMonth: 10000, lastMonth: 9500 },
  { month: 'Oct', thisMonth: 18000, lastMonth: 17000 },
  { month: 'Nov', thisMonth: 6000, lastMonth: 5500 },
  { month: 'Dec', thisMonth: 14000, lastMonth: 13000 },
];

export function ExpenseChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="font-headline">Expense Statistics</CardTitle>
        <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Checkbox id="this-month" defaultChecked />
                <Label htmlFor="this-month">This Month</Label>
            </div>
             <div className="flex items-center gap-2">
                <Checkbox id="last-month" />
                <Label htmlFor="last-month">Last Month</Label>
            </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={{}} className="w-full h-full">
           <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                    <Tooltip 
                        cursor={{fill: 'hsla(var(--primary), 0.1)'}}
                        content={<ChartTooltipContent formatter={(value) => value.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })} />} 
                    />
                    <Bar dataKey="thisMonth" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastMonth" fill="hsl(var(--primary), 0.3)" radius={[4, 4, 0, 0]} />
                </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

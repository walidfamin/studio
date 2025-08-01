
'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';


const chartData = [
  { month: 'May', income: 25000 },
  { month: 'Jun', income: 35000 },
  { month: 'Jul', income: 24734 },
  { month: 'Aug', income: 42000 },
  { month: 'Sep', income: 20000 },
  { month: 'Oct', income: 32000 },
];

export function IncomeChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="font-headline">Income Statistics</CardTitle>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">2022 <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>2021</DropdownMenuItem>
                <DropdownMenuItem>2022</DropdownMenuItem>
                <DropdownMenuItem>2023</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={{}} className="w-full h-full">
           <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                    <Tooltip 
                        cursor={{fill: 'hsla(var(--primary), 0.1)'}}
                        content={<ChartTooltipContent formatter={(value) => Number(value).toLocaleString('en-AE', { style: 'currency', currency: 'AED' })} />} 
                    />
                    <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.month === 'Jul' ? 'hsl(var(--primary))' : 'hsl(var(--primary), 0.3)'} />
                        ))}
                    </Bar>
                </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

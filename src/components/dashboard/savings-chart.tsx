
'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';


const chartData = [
  { month: 'Apr', savings: 8162 },
  { month: 'May', savings: 8162 },
  { month: 'Jun', savings: 15000 },
  { month: 'Jul', savings: 24734 },
  { month: 'Aug', savings: 20000 },
  { month: 'Sep', savings: 28000 },
];

export function SavingsChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="font-headline">Savings</CardTitle>
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
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip
                content={<ChartTooltipContent formatter={(value: number, name, props) => (
                    <div className="flex flex-col">
                        <span>{props.payload.month}</span>
                        <span className="font-bold">{value.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</span>
                    </div>
                )} hideLabel />}
              />
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorSavings)" dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
              <ReferenceDot x="May" y={8162} r={8} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} />
              <ReferenceDot x="Jul" y={24734} r={8} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

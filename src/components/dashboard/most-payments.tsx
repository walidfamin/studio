
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { Progress } from '../ui/progress';

const paymentData = [
    { category: 'Groceries', amount: 478, progress: 95 },
    { category: 'Mortgage', amount: 305, progress: 60 },
    { category: 'Food', amount: 298, progress: 58 },
    { category: 'Gas', amount: 254, progress: 50 },
    { category: 'Clothes', amount: 214, progress: 42 },
    { category: 'Starbucks', amount: 202, progress: 40 },
    { category: 'Transportation', amount: 152, progress: 30 },
]

export function MostPayments() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="font-headline">Most Payments</CardTitle>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Week <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Day</DropdownMenuItem>
                <DropdownMenuItem>Week</DropdownMenuItem>
                <DropdownMenuItem>Month</DropdownMenuItem>
                <DropdownMenuItem>Year</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {paymentData.map(item => (
                <div key={item.category}>
                    <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">{item.amount.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</span>
                    </div>
                    <Progress value={item.progress} />
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

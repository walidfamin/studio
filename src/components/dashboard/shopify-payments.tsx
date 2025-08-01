
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';


const paymentData = [
    { month: 'October', date: '12 Oct', amount: 78256 },
    { month: 'September', date: '23 Sep', amount: 45352 },
    { month: 'August', date: '24 Aug', amount: 44734 },
    { month: 'July', date: '13 Jul', amount: 37377 },
    { month: 'June', date: '24 Jun', amount: 38733 },
    { month: 'May', date: '12 May', amount: 26488 },
]

export function ShopifyPayments() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="font-headline">Shopify Payment</CardTitle>
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentData.map((payment) => (
              <TableRow key={payment.month}>
                <TableCell>{payment.month}</TableCell>
                <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                <TableCell className="text-right font-medium">{payment.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

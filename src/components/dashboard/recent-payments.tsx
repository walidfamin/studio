
'use client'

import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '../ui/input';

const payments = [
    { name: 'Bessie Cooper', type: 'Salary', status: 'Paid', date: '22 Apr, 2023', amount: 782.01, avatar: 'BC' },
    { name: 'John Williamson', type: 'Plumber', status: 'Unpaid', date: '09 Apr, 2023', amount: 106.58, avatar: 'JW' },
    { name: 'Wade Warren', type: 'Groceries', status: 'Pending', date: '27 Mar, 2023', amount: 219.78, avatar: 'WW' },
    { name: 'Jacob Jones', type: 'Mortgage', status: 'Unpaid', date: '18 Mar, 2023', amount: 396.84, avatar: 'JJ' },
    { name: 'Daryl Robertson', type: 'Electrician', status: 'Pending', date: '06 Mar, 2023', amount: 406.27, avatar: 'DR' },
    { name: 'Guy Hawkins', type: 'Salary', status: 'Paid', date: '19 Feb, 2023', amount: 778.35, avatar: 'GH' },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid': return 'default';
        case 'unpaid': return 'destructive';
        case 'pending': return 'secondary';
        default: return 'outline';
    }
}

export function RecentPayments() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="font-headline">Recent Payments</CardTitle>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">2021 <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>2021</DropdownMenuItem>
                    <DropdownMenuItem>2022</DropdownMenuItem>
                    <DropdownMenuItem>2023</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receiver</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.name}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback>{payment.avatar}</AvatarFallback>
                    </Avatar>
                    <span>{payment.name}</span>
                  </div>
                </TableCell>
                <TableCell>{payment.type}</TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge></TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="text-right font-medium">{payment.amount.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

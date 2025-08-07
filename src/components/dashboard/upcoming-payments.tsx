
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { upcomingPayments as initialPayments, updateUpcomingPaymentStatus, deleteUpcomingPayment } from '@/lib/data';
import { UpcomingPayment } from '@/lib/types';
import { useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Trash2, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const getStatusBadgeVariant = (status: UpcomingPayment['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Scheduled': return 'secondary';
        case 'Upcoming':
        default:
             return 'outline';
    }
}

export function UpcomingPayments() {
  const [payments, setPayments] = useState<UpcomingPayment[]>(initialPayments);

  const handleStatusChange = (id: string, status: UpcomingPayment['status']) => {
    updateUpcomingPaymentStatus(id, status);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDelete = (id: string) => {
    deleteUpcomingPayment(id);
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {payments.length > 0 ? payments.map(payment => (
            <li key={payment.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground w-12">{format(parseISO(payment.date), 'MMM d')}</span>
                <span className="font-semibold">{payment.name}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'Paid')}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'Upcoming')}>
                            <Clock className="mr-2 h-4 w-4" /> Mark as Upcoming
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(payment.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming payments.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

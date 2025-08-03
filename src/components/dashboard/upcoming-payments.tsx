'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '../ui/badge';

const payments = [
  { date: 'Aug 5', name: 'Rent', status: 'Upcoming' },
  { date: 'Aug 10', name: 'Car Insurance', status: 'Scheduled' },
  { date: 'Aug 15', name: 'Credit Card Due', status: 'Paid' },
];

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Scheduled': return 'secondary';
        case 'Upcoming':
        default:
             return 'outline';
    }
}

export function UpcomingPayments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {payments.map(payment => (
            <li key={payment.name} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{payment.date}</span>
                <span className="font-semibold">{payment.name}</span>
              </div>
              <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

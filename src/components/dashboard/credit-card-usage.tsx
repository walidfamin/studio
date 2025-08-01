'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CreditCard } from 'lucide-react';

export function CreditCardUsage() {
  const limit = 35200;
  const spent = 5715.92;
  const progressValue = (spent / limit) * 100;

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-accent" />
          Credit Card
        </CardTitle>
        <CardDescription>Limit: {limit.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{spent.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })} spent</div>
        <p className="text-xs text-muted-foreground">
          {(limit - spent).toLocaleString('en-AE', { style: 'currency', currency: 'AED' })} remaining
        </p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <Progress value={progressValue} aria-label={`${progressValue.toFixed(2)}% of credit limit used`} />
        <p className="text-sm text-muted-foreground">Next payment due: July 25, 2024</p>
      </CardFooter>
    </Card>
  );
}

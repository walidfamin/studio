import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function IncomeTracker() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-headline">Income</CardTitle>
        <TrendingUp className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">$5,350.00</div>
        <p className="text-xs text-muted-foreground">
          +15.2% from last month
        </p>
      </CardContent>
    </Card>
  );
}

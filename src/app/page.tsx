
import { Button } from '@/components/ui/button';
import { Search, Bell, Calendar as CalendarIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { TransactionsOverTime } from '@/components/dashboard/transactions-over-time';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';
import { IncomeTracker } from '@/components/dashboard/income-tracker';
import { CreditCardUsage } from '@/components/dashboard/credit-card-usage';
import { AccountOverview } from '@/components/dashboard/overview';

import { Input } from '@/components/ui/input';
import { InvestmentOverview } from '@/components/dashboard/investment-overview';


export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <header className="bg-white border-b p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Hi, Shawn. Welcome to your Dashboard</h1>
          <p className="text-muted-foreground">Let's see what you got there today. Shall We?</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Friday, 28th April</span>
            </Button>
            <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
            </div>
            <Button variant="ghost" size="icon">
                <Bell />
            </Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <TransactionsOverTime />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccountOverview />
                <InvestmentOverview />
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <IncomeTracker />
                    <CreditCardUsage />
                  </div>
                </div>
            </div>
             <div className="lg:col-span-1">
                <SpendingBreakdown />
            </div>
             <div className="lg:col-span-3">
                <RecentTransactions />
            </div>
        </div>
      </main>
    </div>
  );
}

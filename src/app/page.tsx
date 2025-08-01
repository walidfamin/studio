import Header from '@/components/header';
import { AccountOverview } from '@/components/dashboard/overview';
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { TransactionsOverTime } from '@/components/dashboard/transactions-over-time';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Welcome Back, Alex</h1>
              <p className="text-muted-foreground">Here's your financial overview for this month.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" asChild>
                <Link href="/transactions-template.csv" download>
                  <Download className="mr-2" />
                  Template
                </Link>
              </Button>
              <Button variant="outline">
                <Upload className="mr-2" />
                Import
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <AccountOverview />
            </div>
            <div className="lg:row-span-2">
              <SpendingBreakdown />
            </div>
            <div className="lg:col-span-2">
              <TransactionsOverTime />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <RecentTransactions />
          </div>
        </div>
      </main>
    </div>
  );
}

import Header from '@/components/header';
import { AccountOverview } from '@/components/dashboard/overview';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { CreditCardUsage } from '@/components/dashboard/credit-card-usage';
import { IncomeTracker } from '@/components/dashboard/income-tracker';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Welcome Back, Alex</h1>
            <p className="text-muted-foreground">Here's your financial overview for this month.</p>
          </div>
          
          <AccountOverview />
          <CreditCardUsage />
          <IncomeTracker />
          
          <div className="md:col-span-2 lg:col-span-3">
            <SpendingChart />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <RecentTransactions />
          </div>
        </div>
      </main>
    </div>
  );
}

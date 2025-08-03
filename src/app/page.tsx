

'use client';
import { transactions, investments, accounts } from '@/lib/data';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TransactionsOverTime } from '@/components/dashboard/transactions-over-time';
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';
import { InvestmentOverview } from '@/components/dashboard/investment-overview';
import { CumulativeSavings } from '@/components/dashboard/cumulative-savings';
import { HighestMonthlyExpenses } from '@/components/dashboard/highest-monthly-expenses';
import { UpcomingPayments } from '@/components/dashboard/upcoming-payments';
import { RecurringExpenses } from '@/components/dashboard/recurring-expenses';


function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const walidTransactions = useMemo(() => {
    return transactions.filter(t => t.assignedTo === 'Walid');
  }, []);

  const {
    totalIncome,
    totalExpenses,
    netSavings,
    investmentsMade,
  } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investmentAmount = 0;

    walidTransactions.forEach(t => {
      if (t.type === 'income' && t.category === 'Salary') {
        income += t.amount;
      } else if (t.type === 'expense') {
        if (t.category === 'Investment') {
          investmentAmount += t.amount;
        } else if (t.category !== 'Credit Card Payment' && t.category !== 'Transfer') {
          expenses += t.amount;
        }
      }
    });

    const totalStartingBalance = accounts.reduce((total, account) => {
        const accountTransactions = walidTransactions
            .filter(t => t.accountId === account.id && t.balance !== undefined && t.balance !== null)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if(accountTransactions.length > 0) {
            return total + (accountTransactions[0].balance ?? 0);
        }
        return total;
    }, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: totalStartingBalance + income - expenses,
      investmentsMade: investmentAmount,
    };
  }, [walidTransactions]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Income" value={formatCurrency(totalIncome)} />
          <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} />
          <StatCard title="Net Savings" value={formatCurrency(netSavings)} />
          <StatCard title="Investments Made" value={formatCurrency(investmentsMade)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TransactionsOverTime transactions={walidTransactions} />
          </div>
          <div>
            <SpendingBreakdown transactions={walidTransactions} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <CumulativeSavings transactions={walidTransactions} />
          <HighestMonthlyExpenses transactions={walidTransactions} />
          <UpcomingPayments />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RecurringExpenses transactions={walidTransactions} />
          </div>
          <div className="lg:col-span-2">
            <InvestmentOverview transactions={walidTransactions} />
          </div>
        </div>
      </main>
    </div>
  );
}

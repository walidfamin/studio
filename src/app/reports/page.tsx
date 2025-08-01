
'use client';

import { TransactionsOverTime } from "@/components/dashboard/transactions-over-time";
import { SpendingByCategory } from "@/components/reports/spending-by-category";
import { transactions } from "@/lib/data";

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground mb-4">Reports</h1>
        <div className="space-y-8">
          <SpendingByCategory transactions={transactions} />
          <TransactionsOverTime />
        </div>
      </div>
    </div>
  )
}

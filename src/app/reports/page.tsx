
'use client';

import { TransactionsOverTime } from "@/components/dashboard/transactions-over-time";
import { SpendingByCategory } from "@/components/reports/spending-by-category";
import { transactions } from "@/lib/data";
import { useMemo } from "react";

export default function ReportsPage() {
  const walidTransactions = useMemo(() => {
    return transactions.filter(t => t.assignedTo === 'Walid');
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground mb-4">Reports</h1>
        <div className="space-y-8">
          <SpendingByCategory transactions={walidTransactions} />
          <TransactionsOverTime transactions={walidTransactions} />
        </div>
      </div>
    </div>
  )
}

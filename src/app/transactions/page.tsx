
'use client';

import { TransactionTable } from "@/components/transactions/transaction-table";
import { transactions as initialTransactions } from "@/lib/data";
import React from "react";


export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState(initialTransactions);
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold font-headline">All Transactions</h1>
            <p className="text-muted-foreground">A complete list of all your recorded transactions.</p>
        </header>
        <TransactionTable transactions={transactions} setTransactions={setTransactions} />
      </div>
    </div>
  )
}

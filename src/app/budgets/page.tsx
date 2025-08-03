
'use client';

import { useState, useMemo, useEffect } from 'react';
import { transactions as globalTransactions } from '@/lib/data';
import { Transaction } from '@/lib/types';
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';
import { TransactionsOverTime } from '@/components/dashboard/transactions-over-time';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

type Assignee = 'Nathalie' | 'Company';

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


export default function BudgetsPage() {
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee>('Nathalie');
  const [transactions, setTransactions] = useState(globalTransactions);

  useEffect(() => {
    // This is a simple way to listen for changes. In a real app, you'd use a state management library.
    const interval = setInterval(() => {
        const hasChanged = transactions.length !== globalTransactions.length || 
            JSON.stringify(transactions) !== JSON.stringify(globalTransactions);
      if (hasChanged) {
        setTransactions([...globalTransactions]);
      }
    }, 500); // Check for changes
    return () => clearInterval(interval);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.assignedTo === selectedAssignee);
  }, [selectedAssignee, transactions]);

  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'income' && t.category !== 'Transfer' && t.category !== 'Credit Card Payment') {
        income += t.amount;
      } else if (t.type === 'expense' && t.category !== 'Transfer' && t.category !== 'Credit Card Payment' && t.category !== 'Investment') {
        expenses += t.amount;
      }
    });

    return { totalIncome: income, totalExpenses: expenses, netBalance: income - expenses };
  }, [filteredTransactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Budgets</h1>
        <div className="w-48">
          <Select onValueChange={(value: Assignee) => setSelectedAssignee(value)} defaultValue={selectedAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Select a budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nathalie">Nathalie's Budget</SelectItem>
              <SelectItem value="Company">Company Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} />
        <StatCard title="Net Balance" value={formatCurrency(netBalance)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingBreakdown transactions={filteredTransactions} />
        <TransactionsOverTime transactions={filteredTransactions} />
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
            <p>No transactions assigned to "{selectedAssignee}".</p>
            <p className="text-sm">You can assign transactions from the account details page.</p>
        </div>
      )}
    </div>
  );
}

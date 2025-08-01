
import { TransactionTable } from "@/components/transactions/transaction-table";
import { transactions } from "@/lib/data";


export default function TransactionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold font-headline">All Transactions</h1>
            <p className="text-muted-foreground">A complete list of all your recorded transactions.</p>
        </header>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  )
}

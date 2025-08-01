import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function AccountsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground mb-4">All Accounts</h1>
        <RecentTransactions />
      </div>
    </div>
  )
}

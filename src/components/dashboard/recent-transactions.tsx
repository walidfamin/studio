
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { transactions } from '@/lib/data';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';


export function RecentTransactions() {
  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline">Recent Transactions</CardTitle>
          <CardDescription>
            A log of your recent income and expenses.
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 5).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Link href={`/accounts/${transaction.accountId}`} className="flex items-center gap-3 group">
                    <div className="p-2 bg-muted rounded-full">
                       {transaction.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                        <div className="font-medium group-hover:underline">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{format(new Date(transaction.date), 'PP')}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                   <Badge className="text-xs" variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{transaction.category}</TableCell>
                <TableCell className="hidden md:table-cell">{format(new Date(transaction.date), 'PP')}</TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : ''}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No transactions yet. Import a statement to get started.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

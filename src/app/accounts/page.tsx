
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { accounts as allAccounts, transactions } from "@/lib/data";
import { Account, Transaction } from "@/lib/types";
import { ArrowUp, ChevronDown, RefreshCw, Plus } from "lucide-react";
import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  ComposedChart,
  LineChart,
} from "recharts"
import { useMemo } from "react";
import Link from 'next/link';
import { formatCurrency } from "@/lib/utils";


const accountGroups: Record<string, { title: string, accounts: Account[] }> = {
    cash: { title: 'Cash', accounts: [] },
    credit: { title: 'Credit Cards', accounts: [] },
    investment: { title: 'Investments', accounts: [] },
    loan: { title: 'Loans', accounts: [] },
};

allAccounts.forEach(account => {
    switch (account.type) {
        case 'Current Account':
        case 'E Saving Account':
        case 'Saving Account':
            accountGroups.cash.accounts.push(account);
            break;
        case 'Credit Card':
             accountGroups.credit.accounts.push(account);
            break;
    }
});

function AccountRow({ account }: { account: Account }) {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const balance = accountTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + t.amount;
        if (t.type === 'expense') return acc - t.amount;
        return acc;
    }, 0);

    const chartData = useMemo(() => {
        // Create a mini-chart for the last few transactions
        const recentTransactions = accountTransactions.slice(0, 15).reverse();
        let runningBalance = 0;
        return recentTransactions.map(t => {
            runningBalance += t.type === 'income' ? t.amount : -t.amount;
            return { v: runningBalance };
        });
    }, [accountTransactions]);

    return (
         <Link href={`/accounts/${account.id}`} className="block">
            <div className="flex items-center py-4 hover:bg-muted/50 px-6">
                <div className="w-10 h-10 bg-muted rounded-full mr-4 flex items-center justify-center">
                    <Image src={`https://logo.clearbit.com/${account.bank.split(' ')[0].toLowerCase()}.com`} alt={account.bank} width={24} height={24} className="rounded-full" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="flex-1">
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.type}</p>
                </div>
                <div className="w-20 h-8 mr-4">
                    {chartData.length > 1 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="text-right">
                    <p className="font-semibold">{formatCurrency(balance)}</p>
                    {/* <p className="text-sm text-muted-foreground">17 hours ago</p> */}
                </div>
            </div>
        </Link>
    );
}

function AccountGroup({ title, accounts, change, changePercent }: { title: string, accounts: Account[], change: number, changePercent: number }) {
    const total = accounts.reduce((sum, acc) => {
         const accountTransactions = transactions.filter(t => t.accountId === acc.id);
         const balance = accountTransactions.reduce((acc, t) => {
            if (t.type === 'income') return acc + t.amount;
            if (t.type === 'expense') return acc - t.amount;
            return acc;
        }, 0);
        return sum + balance;
    }, 0);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{formatCurrency(Math.abs(total))}</p>
                </div>
            </CardHeader>
            <CardContent className="divide-y p-0">
                {accounts.map(account => <AccountRow key={account.id} account={account} />)}
            </CardContent>
        </Card>
    )
}

export default function AccountsPage() {
    
    const { netWorth, totalAssets, totalLiabilities, netWorthChartData } = useMemo(() => {
        let netWorth = 0;
        let totalAssets = 0;
        let totalLiabilities = 0;

        const monthlyData: Record<string, { income: number; expense: number; netWorth: number; cash: number; investments: number; other: number; date: Date }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            if (!monthlyData[month]) {
                 monthlyData[month] = { date, income: 0, expense: 0, netWorth: 0, cash: 0, investments: 0, other: 0 };
            }

            if (t.type === 'income') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expense += t.amount;
            }
        });

        allAccounts.forEach(account => {
            const accountTransactions = transactions.filter(t => t.accountId === account.id);
            const balance = accountTransactions.reduce((acc, t) => {
                if (t.type === 'income') return acc + t.amount;
                if (t.type === 'expense') return acc - t.amount;
                return acc;
            }, 0);

            if (balance > 0) {
                totalAssets += balance;
            } else {
                totalLiabilities += balance;
            }
            netWorth += balance;

            accountTransactions.forEach(t => {
                const date = new Date(t.date);
                const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                const accountType = account.type;

                const amount = t.type === 'income' ? t.amount : -t.amount;
                
                if (accountType === 'Current Account' || accountType === 'Saving Account' || accountType === 'E Saving Account') {
                    if (monthlyData[month]) monthlyData[month].cash += amount;
                } else if (accountType === 'Credit Card') {
                    // Already handled in liabilities
                } else {
                    if (monthlyData[month]) monthlyData[month].other += amount;
                }
            })
        });

        const sortedMonths = Object.values(monthlyData).sort((a,b) => a.date.getTime() - b.date.getTime());
        
        let runningNetWorth = 0;
        const netWorthChartData = sortedMonths.map(data => {
            runningNetWorth += data.income - data.expense;
            return {
                name: data.date.toLocaleString('default', { month: 'short' }),
                netWorth: runningNetWorth,
                cash: data.cash,
                investments: data.investments,
                other: data.other,
            };
        });


        return { netWorth, totalAssets, totalLiabilities, netWorthChartData };

    }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Accounts</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4"/> Refresh all</Button>
                <Button asChild><Link href="/accounts/new"><Plus className="mr-2 h-4 w-4"/> Add account</Link></Button>
            </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardDescription>NET WORTH</CardDescription>
                                <div className="flex items-baseline gap-2">
                                    <CardTitle className="text-4xl font-bold">{formatCurrency(netWorth)}</CardTitle>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={netWorthChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${Number(value) / 1000}k AED`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                                <Legend />
                                <Bar dataKey="cash" stackId="a" fill="hsl(var(--chart-1))" name="Cash" />
                                <Bar dataKey="investments" stackId="a" fill="hsl(var(--chart-2))" name="Investments"/>
                                <Bar dataKey="other" stackId="a" fill="hsl(var(--chart-3))" name="Other Assets" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Net Worth" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {accountGroups.cash.accounts.length > 0 && 
                    <AccountGroup title="Cash" accounts={accountGroups.cash.accounts} change={0} changePercent={0} />
                }
                {accountGroups.credit.accounts.length > 0 &&
                    <AccountGroup title="Credit Cards" accounts={accountGroups.credit.accounts} change={0} changePercent={0} />
                }
                {accountGroups.investment.accounts.length > 0 &&
                    <AccountGroup title="Investments" accounts={accountGroups.investment.accounts} change={0} changePercent={0} />
                }

            </div>

            <div className="xl:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Assets</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Cash</span>
                                    <span>
                                        {formatCurrency(accountGroups.cash.accounts.reduce((sum, acc) => {
                                             const accountTransactions = transactions.filter(t => t.accountId === acc.id);
                                             const balance = accountTransactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
                                             return sum + balance;
                                        }, 0))}
                                    </span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Investments</span>
                                    <span>{formatCurrency(0)}</span>
                                </li>
                             </ul>
                            <Separator className="my-4" />
                            <div className="flex justify-between font-bold">
                                <span>Total Assets</span>
                                <span>{ formatCurrency(totalAssets) }</span>
                            </div>
                        </div>
                        <Separator className="my-4"/>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Liabilities</h3>
                             <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                     <span>Credit Cards</span>
                                      <span>
                                        {formatCurrency(accountGroups.credit.accounts.reduce((sum, acc) => {
                                             const accountTransactions = transactions.filter(t => t.accountId === acc.id);
                                             const balance = accountTransactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
                                             return sum + balance;
                                        }, 0))}
                                    </span>
                                </li>
                            </ul>
                            <Separator className="my-4" />
                            <div className="flex justify-between font-bold">
                                <span>Total Liabilities</span>
                                <span>{ formatCurrency(totalLiabilities) }</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}

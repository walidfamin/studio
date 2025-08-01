'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { accounts as allAccounts, spendingData } from "@/lib/data";
import { Account } from "@/lib/types";
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

const accountGroups: Record<string, { title: string, accounts: Account[] }> = {
    cash: { title: 'Cash', accounts: [] },
    credit: { title: 'Credit Cards', accounts: [] },
    investment: { title: 'Investments', accounts: [] },
    loan: { title: 'Loans', accounts: [] },
};

allAccounts.forEach(account => {
    if (account.type === 'budget' && !account.negative) {
        accountGroups.cash.accounts.push(account);
    } else if (account.type === 'budget' && account.negative) {
        accountGroups.credit.accounts.push(account);
    } else if (account.type === 'tracking' && (account.name.includes('Retirement') || account.name.includes('401K'))) {
        accountGroups.investment.accounts.push(account);
    } else if (account.type === 'loan') {
        accountGroups.loan.accounts.push(account);
    }
});


const chartData = [
  { name: 'Apr', cash: 40000, investments: 250000, other: 100000, netWorth: 390000 },
  { name: 'May', cash: 45000, investments: 260000, other: 105000, netWorth: 410000 },
  { name: 'Jun', cash: 50000, investments: 280000, other: 110000, netWorth: 440000 },
  { name: 'Jul', cash: 52000, investments: 290000, other: 115000, netWorth: 457000 },
  { name: 'Aug', cash: 55000, investments: 310000, other: 120000, netWorth: 485000 },
  { name: 'Sep', cash: 60000, investments: 320000, other: 125000, netWorth: 505000 },
  { name: 'Oct', cash: 62000, investments: 340000, other: 130000, netWorth: 532000 },
  { name: 'Nov', cash: 65000, investments: 350000, other: 135000, netWorth: 550000 },
  { name: 'Dec', cash: 70000, investments: 370000, other: 140000, netWorth: 580000 },
  { name: 'Jan', cash: 72000, investments: 390000, other: 145000, netWorth: 607000 },
  { name: 'Feb', cash: 75000, investments: 410000, other: 150000, netWorth: 635000 },
];

function AccountRow({ account }: { account: Account }) {
    return (
        <div className="flex items-center py-4">
            <div className="w-10 h-10 bg-muted rounded-full mr-4 flex items-center justify-center">
                 <Image src={`https://logo.clearbit.com/${account.name.split(' ')[0].toLowerCase()}.com`} alt={account.name} width={24} height={24} className="rounded-full" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <div className="flex-1">
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.type === 'budget' ? (account.negative ? 'Credit Card' : 'Checking') : 'Investment'}</p>
            </div>
            <div className="w-20 h-8 mr-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v:0},{v:10},{v:5},{v:15}]}>
                        <Line type="monotone" dataKey="v" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="text-right">
                <p className="font-semibold">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground">17 hours ago</p>
            </div>
        </div>
    );
}

function AccountGroup({ title, accounts, change, changePercent }: { title: string, accounts: Account[], change: number, changePercent: number }) {
    const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const isNegative = total < 0;
    const isChangePositive = change > 0;
    
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className={`flex items-center text-sm ${isChangePositive ? 'text-green-500' : 'text-red-500'}`}>
                        <ArrowUp className={`w-4 h-4 ${!isChangePositive && 'rotate-180'}`} />
                        <span>${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({changePercent.toFixed(1)}%)</span>
                        <span className="text-muted-foreground ml-2">This month</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="divide-y">
                {accounts.map(account => <AccountRow key={account.id} account={account} />)}
            </CardContent>
        </Card>
    )
}

export default function AccountsPage() {
    const netWorth = allAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Accounts</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4"/> Refresh all</Button>
                <Button><Plus className="mr-2 h-4 w-4"/> Add account</Button>
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
                                    <CardTitle className="text-4xl font-bold">${netWorth.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</CardTitle>
                                    <div className="flex items-center text-green-500">
                                        <ArrowUp className="w-4 h-4"/>
                                        <span>$4,622.51 (0.7%) This month</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Net worth breakdown <ChevronDown className="ml-2 w-4 h-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Assets</DropdownMenuItem>
                                        <DropdownMenuItem>Liabilities</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Monthly <ChevronDown className="ml-2 w-4 h-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Daily</DropdownMenuItem>
                                        <DropdownMenuItem>Weekly</DropdownMenuItem>
                                        <DropdownMenuItem>Monthly</DropdownMenuItem>
                                        <DropdownMenuItem>Yearly</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                <Tooltip />
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
                    <AccountGroup title="Cash" accounts={accountGroups.cash.accounts} change={266.64} changePercent={-0.4} />
                }
                {accountGroups.credit.accounts.length > 0 &&
                    <AccountGroup title="Credit Cards" accounts={accountGroups.credit.accounts} change={247.53} changePercent={-10.7} />
                }
                {accountGroups.investment.accounts.length > 0 &&
                    <AccountGroup title="Investments" accounts={accountGroups.investment.accounts} change={1917.61} changePercent={0.4} />
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
                                <li className="flex justify-between"><span>Investments</span><span>$541,718.23</span></li>
                                <li className="flex justify-between"><span>Real Estate</span><span>$350,000.00</span></li>
                                <li className="flex justify-between"><span>Cash</span><span>$66,006.01</span></li>
                                <li className="flex justify-between"><span>Vehicles</span><span>$0.00</span></li>
                            </ul>
                            <Separator className="my-4" />
                            <div className="flex justify-between font-bold">
                                <span>Total Assets</span>
                                <span>$957,724.24</span>
                            </div>
                        </div>
                        <Separator className="my-4"/>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Liabilities</h3>
                             <ul className="space-y-2 text-sm">
                                <li className="flex justify-between"><span>Loans</span><span>$270,350.06</span></li>
                                <li className="flex justify-between"><span>Credit Cards</span><span>$2,076.53</span></li>
                            </ul>
                            <Separator className="my-4" />
                            <div className="flex justify-between font-bold">
                                <span>Total Liabilities</span>
                                <span>$272,426.59</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}


'use client';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from '@/components/ui/sidebar';
import { TreePalm, Landmark, BarChart, Banknote, Settings, LifeBuoy, ChevronDown, BadgePercent, Building, Home, CreditCard, PiggyBank, PlusCircle, List, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { accounts, transactions as globalTransactions } from '@/lib/data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { Account, Transaction } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

const accountGroups = accounts.reduce((acc, account) => {
  if (!acc[account.bank]) {
    acc[account.bank] = [];
  }
  acc[account.bank].push(account);
  return acc;
}, {} as Record<string, Account[]>);

const getAccountBalance = (accountId: string, transactions: Transaction[]) => {
    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.assignedTo === 'Walid');
    
    if (accountTransactions.length === 0) return 0;
    
    const accountType = accounts.find(a => a.id === accountId)?.type;

    if (accountType === 'Credit Card') {
         return accountTransactions.reduce((acc, t) => {
            if (t.type === 'expense') return acc + t.amount;
            if (t.type === 'income' && t.category === 'Credit Card Payment') return acc - t.amount;
            return acc;
        }, 0);
    }
    
    const statementTransactions = accountTransactions.filter(t => t.balance !== undefined);
    if (statementTransactions.length > 0) {
        const sortedByDate = [...statementTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return sortedByDate[sortedByDate.length - 1].balance ?? 0;
    }

    // Fallback for non-statement accounts
    return accountTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + t.amount;
        if (t.type === 'expense') return acc - t.amount;
        return acc;
    }, 0);
};


export default function AppSidebar() {
  const pathname = usePathname();
  // We use a local state to force re-renders when global data changes.
  const [transactions, setTransactions] = useState(globalTransactions);

  useEffect(() => {
    // This is a simple way to listen for changes. In a real app, you'd use a state management library.
    const interval = setInterval(() => {
      if (transactions.length !== globalTransactions.length) {
        setTransactions([...globalTransactions]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [transactions]);
  
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    accounts.forEach(account => {
        balances[account.id] = getAccountBalance(account.id, transactions);
    });
    return balances;
  }, [transactions]);


  return (
    <Sidebar variant="sidebar" collapsible="icon" className="group-data-[variant=sidebar]:border-r">
       <SidebarHeader className="h-16 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <TreePalm size={20} />
            </div>
            <h1 className="text-xl font-bold font-headline text-sidebar-foreground">FinView</h1>
        </div>
        <SidebarTrigger className="text-sidebar-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/">
                <BarChart />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/transactions')}>
              <Link href="/transactions">
                <List />
                <span>Transactions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/reports')}>
              <Link href="/reports">
                <Landmark />
                <span>Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/budgets')}>
              <Link href="/budgets">
                <Briefcase />
                <span>Budgets</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/accounts')}>
              <Link href="/accounts">
                <Banknote />
                <span>All Accounts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/investments')}>
              <Link href="/investments">
                <Landmark />
                <span>Investments</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2 mt-4 space-y-2">
          {Object.entries(accountGroups).map(([bank, accounts]) => (
            <Collapsible key={bank} defaultOpen>
              <div className="flex items-center">
                <CollapsibleTrigger asChild>
                   <Button variant="ghost" className="w-full justify-start px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground">
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 mr-2" />
                      <span className="text-xs font-bold uppercase">{bank}</span>
                  </Button>
                </CollapsibleTrigger>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link href={`/accounts/new?bank=${encodeURIComponent(bank)}`}>
                            <Button variant="ghost" size="icon" className="w-6 h-6 ml-auto shrink-0">
                                <PlusCircle className="w-4 h-4 text-sidebar-foreground/60" />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Add account to {bank}</p>
                    </TooltipContent>
                </Tooltip>
              </div>
              <CollapsibleContent className="pl-8 pr-2 py-1 space-y-1 text-sm">
                {accounts.map(account => {
                  const balance = accountBalances[account.id] || 0;
                  return (
                    <Link key={account.id} href={`/accounts/${account.id}`}>
                      <div className={`flex justify-between items-center text-sidebar-foreground/70 rounded-md px-2 py-1 ${pathname === `/accounts/${account.id}` ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'}`}>
                          <span>{account.name}</span>
                          <span className={`font-mono ${balance < 0 ? 'text-red-400' : ''}`}>
                              {formatCurrency(balance)}
                          </span>
                      </div>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

      </SidebarContent>
    </Sidebar>
  );
}

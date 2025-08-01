
'use client';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from '@/components/ui/sidebar';
import { TreePalm, Landmark, BarChart, Banknote, Settings, LifeBuoy, ChevronDown, BadgePercent, Building, Home, CreditCard, PiggyBank, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { accounts } from '@/lib/data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { Account } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const accountGroups = accounts.reduce((acc, account) => {
  if (!acc[account.bank]) {
    acc[account.bank] = [];
  }
  acc[account.bank].push(account);
  return acc;
}, {} as Record<string, Account[]>);


export default function AppSidebar() {
  const pathname = usePathname();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
  };

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
            <SidebarMenuButton asChild isActive={pathname.startsWith('/reports')}>
              <Link href="/reports">
                <Landmark />
                <span>Reports</span>
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
                {accounts.map(account => (
                  <Link key={account.id} href={`/accounts/${account.id}`}>
                    <div className={`flex justify-between items-center text-sidebar-foreground/70 rounded-md px-2 py-1 ${pathname === `/accounts/${account.id}` ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'}`}>
                        <span>{account.name}</span>
                        <span className={`font-mono ${account.balance < 0 ? 'text-red-400' : ''}`}>
                            {formatCurrency(account.balance)}
                        </span>
                    </div>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

      </SidebarContent>
    </Sidebar>
  );
}

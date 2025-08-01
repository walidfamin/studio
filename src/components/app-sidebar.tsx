'use client';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from '@/components/ui/sidebar';
import { TreePalm, Landmark, BarChart, Banknote, Settings, LifeBuoy, ChevronDown, BadgePercent, Building, Home, CreditCard, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { accounts } from '@/lib/data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';

const accountGroups = accounts.reduce((acc, account) => {
  if (!acc[account.type]) {
    acc[account.type] = { total: 0, accounts: [] };
  }
  acc[account.type].accounts.push(account);
  acc[account.type].total += account.balance;
  return acc;
}, {} as Record<string, { total: number, accounts: typeof accounts }>);


export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="group-data-[variant=sidebar]:border-r">
       <SidebarHeader className="h-16 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <TreePalm size={20} />
            </div>
            <h1 className="text-xl font-bold font-headline text-sidebar-foreground">Our Budget</h1>
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
            <SidebarMenuButton asChild isActive={pathname.startsWith('/budget')}>
              <Link href="/budget">
                <BadgePercent />
                <span>Budget</span>
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
          {Object.entries(accountGroups).map(([type, group]) => (
            <Collapsible key={type} defaultOpen>
              <CollapsibleTrigger asChild>
                 <Button variant="ghost" className="w-full justify-between px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        <span className="text-xs font-bold uppercase">{type}</span>
                    </div>
                    <span className="text-xs font-mono">{group.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 pr-2 py-1 space-y-1 text-sm">
                {group.accounts.map(account => (
                  <div key={account.id} className="flex justify-between items-center text-sidebar-foreground/70">
                    <span>{account.name}</span>
                    <span className={`font-mono ${account.negative ? 'text-red-400' : ''}`}>
                        {account.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

      </SidebarContent>
    </Sidebar>
  );
}

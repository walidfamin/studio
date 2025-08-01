
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, MoreHorizontal, ArrowDown, ArrowUp, Search, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { SavingsChart } from '@/components/dashboard/savings-chart';
import { IncomeChart } from '@/components/dashboard/income-chart';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { RecentPayments } from '@/components/dashboard/recent-payments';
import { MonthlyProfits } from '@/components/dashboard/monthly-profits';
import { MostPayments } from '@/components/dashboard/most-payments';
import { ShopifyPayments } from '@/components/dashboard/shopify-payments';
import { Input } from '@/components/ui/input';


export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <header className="bg-white border-b p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Hi, Shawn. Welcome to your Dashboard</h1>
          <p className="text-muted-foreground">Let's see what you got there today. Shall We?</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Friday, 28th April</span>
            </Button>
            <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
            </div>
            <Button variant="ghost" size="icon">
                <Bell />
            </Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <SavingsChart />
            </div>
            <div className="lg:col-span-1">
                <IncomeChart />
            </div>
            <div className="lg:col-span-2">
                <ExpenseChart />
            </div>
             <div className="lg:col-span-3">
                <RecentPayments />
            </div>
            <div className="lg:col-span-1">
                <MostPayments />
            </div>
            <div className="lg:col-span-1">
                <MonthlyProfits />
            </div>
            <div className="lg:col-span-1">
                <ShopifyPayments />
            </div>
        </div>
      </main>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Download, TrendingUp, MoreHorizontal, ArrowDown, ArrowUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b p-4">
        <Tabs defaultValue="spending">
          <TabsList>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
            <TabsTrigger value="income-expense">Income v Expense</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
        <Tabs defaultValue="spending">
          <TabsContent value="spending">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Spending Totals</h1>
                  <p className="text-muted-foreground">Some Categories ▸ Monthly</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline">
                    <TrendingUp className="mr-2" />
                    Trends
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/transactions-template.csv" download>
                      <Download className="mr-2" />
                      Export
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SpendingBreakdown />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">NOV 2021-NOV 2021</CardTitle>
                      <CardDescription>Some categories and accounts excluded</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <p className="text-xs text-muted-foreground">TOTAL SPENDING</p>
                        <p className="text-2xl font-bold">{ (1695.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</p>
                        <p className="text-xs text-muted-foreground">For this time period</p>
                      </div>
                      <Separator/>
                      <div>
                        <p className="text-xs text-muted-foreground">AVERAGE SPENDING</p>
                        <p className="text-2xl font-bold">{ (1695.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</p>
                        <p className="text-xs text-muted-foreground">Per month</p>
                      </div>
                      <Separator/>
                      <div>
                        <h3 className="text-sm font-medium mb-2">CATEGORIES</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>Rent/Mortgage</span> <span>{ (1000.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</span></div>
                          <div className="flex justify-between"><span>Groceries</span> <span>{ (465.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</span></div>
                          <div className="flex justify-between"><span>Electric</span> <span>{ (85.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</span></div>
                          <div className="flex justify-between"><span>Transportation</span> <span>{ (70.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</span></div>
                          <div className="flex justify-between"><span>Phone</span> <span>{ (70.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</span></div>
                          <div className="flex justify-between"><span>TV</span> <span>{ (5.00).toLocaleString('en-AE', { style: 'currency', currency: 'AED' }) }</span></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="net-worth">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Net Worth</h1>
              <p>Coming soon...</p>
            </div>
          </TabsContent>
          <TabsContent value="income-expense">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Income v Expense</h1>
              <p>Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

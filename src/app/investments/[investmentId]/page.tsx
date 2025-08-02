

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { properties as investments } from "@/lib/data";
import { Investment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from 'date-fns';
import { ChevronLeft, Edit, Landmark, Banknote, Users, CalendarDays, BadgeCheck, BadgeX } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


export default function InvestmentDetailPage() {
    const params = useParams();
    const investmentId = params.investmentId as string;

    const investment = useMemo(() => {
        return investments.find(p => p.id === investmentId);
    }, [investmentId]);

    if (!investment) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                 <div className="mb-8">
                     <Link href="/investments" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Investments</span>
                    </Link>
                </div>
                <Card className="text-center py-16">
                    <CardHeader>
                        <CardTitle>Investment not found</CardTitle>
                        <CardDescription>The investment you are looking for does not exist.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const amountRemaining = investment.loanAmount - investment.paymentsMade;
    const progress = (investment.paymentsMade / investment.loanAmount) * 100;


    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <header className="flex items-center justify-between mb-8">
                <div>
                     <Link href="/investments" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Investments</span>
                    </Link>
                    <h1 className="text-3xl font-bold font-headline">{investment.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" asChild>
                        <Link href={`/investments/${investment.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4"/> Edit Investment
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">{formatCurrency(investment.totalValue)}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Initial Investment</p>
                                <p className="text-2xl font-bold">{formatCurrency(investment.downPayment)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className="text-lg font-medium capitalize flex items-center gap-2">
                                    {investment.paymentType === 'mortgage' && <Landmark className="w-5 h-5 text-accent" />}
                                    {investment.paymentType === 'cash' && <Banknote className="w-5 h-5 text-accent" />}
                                    {investment.paymentType === 'installment' && <CalendarDays className="w-5 h-5 text-accent" />}
                                    {investment.paymentType}
                                </p>
                            </div>
                             {investment.paymentType === 'cash' && investment.cashContributors && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Contributors</p>
                                     <p className="text-lg font-medium flex items-center gap-2">
                                        <Users className="w-5 h-5 text-accent" />
                                        {investment.cashContributors.map(c => c.name).join(', ')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3 space-y-6">
                     {investment.paymentType === 'mortgage' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Loan Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-sm font-medium">Loan Progress</span>
                                        <span className="text-xs text-muted-foreground">{formatCurrency(amountRemaining)} remaining</span>
                                    </div>
                                    <Progress value={progress} />
                                    <div className="flex justify-between text-xs mt-1">
                                        <span>{formatCurrency(investment.paymentsMade)} paid</span>
                                        <span>{formatCurrency(investment.loanAmount)} total</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Monthly Installment</span>
                                        <span className="font-medium">{formatCurrency(investment.installmentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Next Installment</span>
                                        <span className="font-medium">{format(new Date(investment.nextInstallmentDate), 'PPP')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {investment.paymentType === 'installment' && investment.paymentPlan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Installment Plan</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {investment.paymentPlan.map((p, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{format(new Date(p.date), 'PPP')}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(p.amount)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={p.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                                        {p.status === 'paid' ? <BadgeCheck className="mr-1 h-3 w-3"/> : <BadgeX className="mr-1 h-3 w-3"/> }
                                                        {p.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    );
}

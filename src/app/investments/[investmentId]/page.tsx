
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { investments, transactions as allTransactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Transaction } from "@/lib/types";

export default function InvestmentDetailPage() {
    const params = useParams();
    const investmentId = params.investmentId as string;

    const investment = useMemo(() => {
        return investments.find(p => p.id === investmentId);
    }, [investmentId]);

    const allocatedTransactions = useMemo(() => {
        return allTransactions.filter(t => t.investmentId === investmentId);
    }, [investmentId]);

    const totalPaid = useMemo(() => {
        return allocatedTransactions.reduce((sum, t) => sum + t.amount, 0);
    }, [allocatedTransactions]);

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
                     <CardContent>
                        <Button asChild>
                             <Link href="/investments">Go Back</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Paid</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Allocated Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allocatedTransactions.length > 0 ? (
                                        allocatedTransactions.map((t: Transaction) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{format(new Date(t.date), 'PPP')}</TableCell>
                                                <TableCell>{t.description}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                No payments have been allocated to this investment yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}



'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { properties as investments } from "@/lib/data";
import { Investment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from 'date-fns';
import { PlusCircle, Landmark, Edit } from "lucide-react";
import Link from "next/link";


function InvestmentCard({ investment }: { investment: Investment }) {
    const amountRemaining = investment.loanAmount - investment.paymentsMade;
    const progress = (investment.paymentsMade / investment.loanAmount) * 100;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <Link href={`/investments/${investment.id}`}>
                            <CardTitle className="font-headline flex items-center gap-2 hover:underline">
                               <Landmark className="w-5 h-5 text-accent"/> {investment.name}
                            </CardTitle>
                        </Link>
                        <CardDescription>{formatCurrency(investment.totalValue)}</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/investments/${investment.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium">Loan Progress</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(amountRemaining)} remaining</span>
                    </div>
                    <Progress value={progress} />
                </div>
                 <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Installment</span>
                        <span className="font-medium">{format(new Date(investment.nextInstallmentDate), 'PPP')}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{formatCurrency(investment.installmentAmount)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function InvestmentsPage() {

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-headline">Investments</h1>
                <div className="flex items-center gap-2">
                    <Button asChild><Link href="/investments/new"><PlusCircle className="mr-2 h-4 w-4"/> Add Investment</Link></Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map(prop => (
                    <InvestmentCard key={prop.id} investment={prop} />
                ))}

                {investments.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                        <p className="mb-2">You haven't added any investments yet.</p>
                        <Button asChild>
                            <Link href="/investments/new">
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Your First Investment
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

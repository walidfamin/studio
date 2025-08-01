

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { properties } from "@/lib/data";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, formatDistanceToNow } from 'date-fns';
import { PlusCircle, Landmark } from "lucide-react";
import Link from "next/link";


function InvestmentCard({ property }: { property: Property }) {
    const amountRemaining = property.loanAmount - property.paymentsMade;
    const progress = (property.paymentsMade / property.loanAmount) * 100;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <Landmark className="w-5 h-5 text-accent"/> {property.name}
                        </CardTitle>
                        <CardDescription>{formatCurrency(property.totalValue)}</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/investments/${property.id}`}>View Details</Link>
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
                        <span className="font-medium">{format(new Date(property.nextInstallmentDate), 'PPP')}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">{formatCurrency(property.installmentAmount)}</span>
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
                {properties.map(prop => (
                    <InvestmentCard key={prop.id} property={prop} />
                ))}

                {properties.length === 0 && (
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


'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { investments, transactions } from "@/lib/data";
import { Investment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Landmark } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

function InvestmentCard({ investment }: { investment: Investment }) {
    
    const totalPaid = useMemo(() => {
        return transactions
            .filter(t => t.investmentId === investment.id)
            .reduce((sum, t) => sum + t.amount, 0);
    }, [investment.id]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <Link href={`/investments/${investment.id}`} className="block hover:underline">
                            <CardTitle className="font-headline flex items-center gap-2">
                               <Landmark className="w-5 h-5 text-accent"/> {investment.name}
                            </CardTitle>
                        </Link>
                        <CardDescription>Total Paid: {formatCurrency(totalPaid)}</CardDescription>
                    </div>
                </div>
            </CardHeader>
             <CardContent>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/investments/${investment.id}`}>View Details</Link>
                </Button>
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

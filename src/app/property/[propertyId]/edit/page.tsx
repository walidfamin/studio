
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { properties } from "@/lib/data";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export default function EditPropertyPage() {
    const params = useParams();
    const propertyId = params.propertyId as string;

    const property = useMemo(() => {
        return properties.find(p => p.id === propertyId);
    }, [propertyId]);

    const [paymentType, setPaymentType] = useState<'mortgage' | 'cash'>(property?.paymentType || 'mortgage');
    
    if (!property) {
        return (
             <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Property Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The property you are trying to edit does not exist.</p>
                        <Button asChild className="mt-4">
                            <Link href="/property">Back to Properties</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                 <Link href={`/property/${propertyId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Property Details</span>
                </Link>
            </div>
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Edit Property</CardTitle>
                    <CardDescription>Update the details of your property asset.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-8">
                        {/* Property Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Property Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="property-name">Property Name</Label>
                                    <Input id="property-name" defaultValue={property.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" defaultValue={property.location} required />
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                         <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Financials</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="total-price">Total Price (AED)</Label>
                                    <Input id="total-price" type="number" defaultValue={property.totalValue} required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="down-payment">Amount Paid / Down Payment (AED)</Label>
                                    <Input id="down-payment" type="number" defaultValue={property.downPayment} required />
                                </div>
                            </div>
                        </div>
                        
                        {/* Payment Method */}
                        <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-5 h-5">
                                            <Info className="w-4 h-4 text-muted-foreground"/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="text-sm">
                                        Select how this property was financed. If you used a bank loan, choose 'Mortgage'. If you paid in full with your own funds, choose 'Cash'.
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <RadioGroup value={paymentType} onValueChange={(value) => setPaymentType(value as 'mortgage' | 'cash')} className="flex gap-4">
                                <Label htmlFor="r-mortgage" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                  <RadioGroupItem value="mortgage" id="r-mortgage" />
                                  Mortgage / Loan
                                </Label>
                                <Label htmlFor="r-cash" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                  <RadioGroupItem value="cash" id="r-cash" />
                                  Paid in Cash
                                </Label>
                            </RadioGroup>
                        </div>


                        {/* Conditional Fields */}
                        {paymentType === 'mortgage' && (
                            <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                <h4 className="font-semibold">Mortgage Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="loan-amount">Loan Amount (AED)</Label>
                                        <Input id="loan-amount" type="number" defaultValue={property.loanAmount} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="installment-amount">Monthly Installment (AED)</Label>
                                        <Input id="installment-amount" type="number" defaultValue={property.installmentAmount} required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentType === 'cash' && (
                             <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                <h4 className="font-semibold">Cash Payment Details</h4>
                                 <div className="space-y-2">
                                    <Label htmlFor="contributors">Contributors</Label>
                                     <Textarea id="contributors" placeholder="e.g., John Doe - 500,000 AED, Jane Doe - 500,000 AED" defaultValue={property.cashContributors?.map(c => `${c.name} - ${c.amount} AED`).join(', ')} />
                                     <p className="text-xs text-muted-foreground">
                                        If paid by multiple people, note down each person and their contribution.
                                     </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" asChild>
                                <Link href={`/property/${propertyId}`}>Cancel</Link>
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


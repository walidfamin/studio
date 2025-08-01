
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export default function NewPropertyPage() {

    const [paymentType, setPaymentType] = useState<'mortgage' | 'cash'>('mortgage');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                 <Link href="/property" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Properties</span>
                </Link>
            </div>
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Add New Property</CardTitle>
                    <CardDescription>Enter the details of your new property asset.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-8">
                        {/* Property Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Property Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="property-name">Property Name</Label>
                                    <Input id="property-name" placeholder="e.g., Marina View Apartment" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" placeholder="e.g., Dubai, UAE" required />
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                         <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Financials</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="total-price">Total Price (AED)</Label>
                                    <Input id="total-price" type="number" placeholder="1,200,000" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="down-payment">Amount Paid / Down Payment (AED)</Label>
                                    <Input id="down-payment" type="number" placeholder="240,000" required />
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
                                        <Input id="loan-amount" type="number" placeholder="960,000" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="installment-amount">Monthly Installment (AED)</Label>
                                        <Input id="installment-amount" type="number" placeholder="5,500" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentType === 'cash' && (
                             <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                <h4 className="font-semibold">Cash Payment Details</h4>
                                 <div className="space-y-2">
                                    <Label htmlFor="contributors">Contributors</Label>
                                     <Textarea id="contributors" placeholder="e.g., John Doe - 500,000 AED, Jane Doe - 500,000 AED" />
                                     <p className="text-xs text-muted-foreground">
                                        If paid by multiple people, note down each person and their contribution.
                                     </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/property">Cancel</Link>
                            </Button>
                            <Button type="submit">Add Property</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

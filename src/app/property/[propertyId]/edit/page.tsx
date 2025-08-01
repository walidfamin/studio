
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { properties, updateProperty } from "@/lib/data";
import { ChevronLeft, Info, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/lib/types";

const formSchema = z.object({
    name: z.string().min(1, "Property name is required."),
    location: z.string().min(1, "Location is required."),
    totalValue: z.coerce.number().min(1, "Total price is required."),
    downPayment: z.coerce.number().min(0),
    paymentType: z.enum(['mortgage', 'cash', 'installment']),
    loanAmount: z.coerce.number().optional(),
    installmentAmount: z.coerce.number().optional(),
    cashContributors: z.string().optional(),
    paymentPlan: z.array(z.object({
        date: z.string().min(1, "Date is required."),
        amount: z.coerce.number().min(1, "Amount is required.")
    })).optional(),
});


export default function EditPropertyPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const propertyId = params.propertyId as string;

    const property = useMemo(() => {
        return properties.find(p => p.id === propertyId);
    }, [propertyId]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    
    useEffect(() => {
        if (property) {
            form.reset({
                name: property.name,
                location: property.location,
                totalValue: property.totalValue,
                downPayment: property.downPayment,
                paymentType: property.paymentType,
                loanAmount: property.loanAmount,
                installmentAmount: property.installmentAmount,
                cashContributors: property.cashContributors?.map(c => `${c.name} - ${c.amount}`).join(', '),
                paymentPlan: property.paymentPlan?.map(p => ({ date: new Date(p.date).toISOString().split('T')[0], amount: p.amount })),
            });
        }
    }, [property, form]);


    const paymentType = form.watch('paymentType');

     const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "paymentPlan",
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!property) return;
        
        const updatedPropertyData = {
            ...values,
            loanAmount: values.loanAmount || 0,
            installmentAmount: values.installmentAmount || 0,
            paymentPlan: values.paymentPlan?.map(p => ({ ...p, status: 'unpaid' as const })), // simplified status
            cashContributors: values.cashContributors ? values.cashContributors.split(',').map(c => {
                const [name, amount] = c.split('-').map(s => s.trim());
                return { name, amount: parseFloat(amount) || 0 };
            }) : [],
        };
        
        updateProperty(propertyId, updatedPropertyData as Partial<Property>);

        toast({
            title: "Property Updated",
            description: `"${values.name}" has been successfully updated.`,
        });
        router.push(`/property/${propertyId}`);
    };
    
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Property Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Property Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="location" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Financials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={form.control} name="totalValue" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Price (AED)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="downPayment" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount Paid / Down Payment (AED)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>
                            
                            {/* Payment Method */}
                            <FormField control={form.control} name="paymentType" render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
                                        <Popover>
                                            <PopoverTrigger asChild><Button variant="ghost" size="icon" className="w-5 h-5"><Info className="w-4 h-4 text-muted-foreground"/></Button></PopoverTrigger>
                                            <PopoverContent className="text-sm">Select how this property was financed.</PopoverContent>
                                        </Popover>
                                    </div>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4">
                                            <FormItem><FormControl><Label htmlFor="r-mortgage" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="mortgage" id="r-mortgage" />Mortgage / Loan</Label></FormControl></FormItem>
                                            <FormItem><FormControl><Label htmlFor="r-cash" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="cash" id="r-cash" />Paid in Cash</Label></FormControl></FormItem>
                                            <FormItem><FormControl><Label htmlFor="r-installment" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="installment" id="r-installment" />Installment Plan</Label></FormControl></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            {/* Conditional Fields */}
                            {paymentType === 'mortgage' && (
                                <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                    <h4 className="font-semibold">Mortgage Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="loanAmount" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Loan Amount (AED)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="installmentAmount" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly Installment (AED)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                </div>
                            )}

                            {paymentType === 'cash' && (
                                <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                    <h4 className="font-semibold">Cash Payment Details</h4>
                                    <FormField control={form.control} name="cashContributors" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contributors</FormLabel>
                                            <FormControl><Textarea placeholder="e.g., John Doe - 500,000 AED, Jane Doe - 500,000 AED" {...field} /></FormControl>
                                            <p className="text-xs text-muted-foreground">If paid by multiple people, note down each person and their contribution.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            )}
                            
                            {paymentType === 'installment' && (
                                <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold">Installment Plan</h4>
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ date: '', amount: 0 })}><PlusCircle className="mr-2 h-4 w-4"/> Add Row</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-start gap-2">
                                                <FormField control={form.control} name={`paymentPlan.${index}.date`} render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl><Input type="date" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                <FormField control={form.control} name={`paymentPlan.${index}.amount`} render={({ field }) => (
                                                    <FormItem className="w-32">
                                                        <FormControl><Input type="number" placeholder="Amount" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
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
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

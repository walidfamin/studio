
'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { accounts, addTransaction, investments } from '@/lib/data';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const formSchema = z.object({
    accountId: z.string({ required_error: 'Please select an account.' }).min(1, "Please select an account."),
    description: z.string().min(1, 'Description is required.'),
    amount: z.coerce.number().positive('Amount must be a positive number.'),
    type: z.enum(['income', 'expense']),
    date: z.date(),
    category: z.string().min(1, 'Category is required.'),
    customCategory: z.string().optional(),
    investmentId: z.string().optional(),
}).refine(data => {
    if (data.category === 'Other' && !data.customCategory) {
        return false;
    }
    return true;
}, {
    message: 'Custom category is required when "Other" is selected.',
    path: ['customCategory'],
});


export function AddTransactionSheet() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: '',
      description: '',
      amount: 0,
      type: 'expense',
      date: new Date(),
      category: '',
      customCategory: '',
      investmentId: '',
    },
  });
  
  const selectedAccountId = form.watch('accountId');
  const selectedCategory = form.watch('category');
  const account = accounts.find(a => a.id === selectedAccountId);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const finalCategory = values.category === 'Other' ? values.customCategory : values.category;
    
    addTransaction({
      ...values,
      category: finalCategory as any, // Cast because we've validated it
    });

    toast({
      title: 'Transaction Added',
      description: 'Your new transaction has been successfully saved.',
    });
    form.reset();
    // Ideally we would close the sheet here, but SheetClose is handling it.
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
                <SheetTitle className="font-headline">Add New Transaction</SheetTitle>
                <SheetDescription>
                Enter the details of your transaction below.
                </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-4">
                <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an account" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {accounts.map(account => (
                                        <SelectItem key={account.id} value={account.id}>{account.name} - {account.bank}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Coffee" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="15.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4"
                                >
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <RadioGroupItem value="expense" id="r1" />
                                    </FormControl>
                                    <FormLabel htmlFor="r1" className="font-normal">Expense</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <RadioGroupItem value="income" id="r2" />
                                    </FormControl>
                                    <FormLabel htmlFor="r2" className="font-normal">Income</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {account?.type === 'Credit Card' ? (
                                    <>
                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                        <SelectItem value="Food">Food</SelectItem>
                                        <SelectItem value="DEWA">DEWA</SelectItem>
                                        <SelectItem value="Etisalat">Etisalat</SelectItem>
                                        <SelectItem value="Du">Du</SelectItem>
                                        <SelectItem value="Travel">Travel</SelectItem>
                                        <SelectItem value="Repair">Repair</SelectItem>
                                        <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="Food">Food</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Spends">Spends</SelectItem>
                                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                        <SelectItem value="Salary">Salary</SelectItem>
                                        <SelectItem value="Rent/Mortgage">Rent/Mortgage</SelectItem>
                                        <SelectItem value="Groceries">Groceries</SelectItem>
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                    </>
                                )}
                                <SelectItem value="Other">Other (Custom)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedCategory === 'Other' && (
                    <FormField
                        control={form.control}
                        name="customCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custom Category</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter custom category" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {selectedCategory === 'Investment' && (
                    <FormField
                        control={form.control}
                        name="investmentId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Allocate to Investment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an investment" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {investments.map(inv => (
                                        <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                )}
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={'outline'}
                                    className={cn(
                                        'pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, 'PPP')
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <SheetFooter>
                <SheetClose asChild>
                <Button type="submit">Save transaction</Button>
                </SheetClose>
            </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

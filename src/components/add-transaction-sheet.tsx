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

export function AddTransactionSheet() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically handle form submission, e.g., send data to an API
    toast({
      title: 'Transaction Added',
      description: 'Your new transaction has been successfully saved.',
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle className="font-headline">Add New Transaction</SheetTitle>
            <SheetDescription>
              Enter the details of your transaction below.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="description" placeholder="e.g., Coffee" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input id="amount" type="number" placeholder="15.00" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <RadioGroup defaultValue="expense" className="col-span-3 flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="r1" />
                  <Label htmlFor="r1">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="r2" />
                  <Label htmlFor="r2">Income</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="spends">Spends</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'col-span-3 justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save transaction</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

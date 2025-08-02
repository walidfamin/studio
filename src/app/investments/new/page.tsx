
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addInvestment } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    name: z.string().min(1, "Investment name is required."),
});

export default function NewInvestmentPage() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const newInvestment = addInvestment({ name: values.name });
        toast({
            title: "Investment Added",
            description: `"${newInvestment.name}" has been successfully added.`,
        });
        router.push(`/investments`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                 <Link href="/investments" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Investments</span>
                </Link>
            </div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Add New Investment</CardTitle>
                    <CardDescription>Enter a title for your new investment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Investment Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Villa in Project, Startup Fund" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/investments">Cancel</Link>
                                </Button>
                                <Button type="submit">Add Investment</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function NewAccountForm() {
    const searchParams = useSearchParams();
    const bank = searchParams.get('bank');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                 <Link href="/accounts" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Accounts</span>
                </Link>
            </div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Create New Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="bank">Bank</Label>
                            <Input id="bank" value={bank || ''} readOnly disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-name">Account Name</Label>
                            <Input id="account-name" placeholder="e.g., John's Checking" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="account-type">Account Type</Label>
                            <Select required>
                                <SelectTrigger id="account-type">
                                    <SelectValue placeholder="Select an account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="current">Current Account</SelectItem>
                                    <SelectItem value="saving">Saving Account</SelectItem>
                                    <SelectItem value="e-saving">E Saving Account</SelectItem>
                                    <SelectItem value="credit-card">Credit Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial-balance">Initial Balance (AED)</Label>
                            <Input id="initial-balance" type="number" placeholder="0.00" required />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/accounts">Cancel</Link>
                            </Button>
                            <Button type="submit">Create Account</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function NewAccountPage() {
    return (
        <Suspense fallback={<div className="p-4 sm:p-6 lg:p-8">Loading account form...</div>}>
            <NewAccountForm />
        </Suspense>
    );
}

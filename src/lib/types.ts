

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Food' | 'Transport' | 'Spends' | 'Investment' | 'Lifestyle' | 'Salary' | 'Rent/Mortgage' | 'Groceries' | 'Uncategorized' | 'Credit Card Payment' | 'Transfer';
  accountId: string;
  importId?: string; // To track which import a transaction came from
  balance?: number; // Running balance from the statement
};

export type Account = {
  id: string;
  name: string;
  balance: number;
  type: 'Credit Card' | 'Saving Account' | 'Current Account' | 'E Saving Account' | 'New Account';
  bank: string;
};

export type Contributor = {
  name: string;
  amount: number;
};

export type Installment = {
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
};

export type Investment = {
  id: string;
  name: string;
  location: string;
  totalValue: number;
  downPayment: number;
  paymentType: 'mortgage' | 'cash' | 'installment';
  cashContributors?: Contributor[];
  loanAmount: number;
  installmentAmount: number;
  nextInstallmentDate: string;
  paymentsMade: number;
  paymentPlan?: Installment[];
};

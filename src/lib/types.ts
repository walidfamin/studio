export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
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

export type Property = {
  id: string;
  name: string;
  location: string;
  totalValue: number;
  downPayment: number;
  paymentType: 'mortgage' | 'cash';
  cashContributors?: Contributor[];
  loanAmount: number;
  installmentAmount: number;
  nextInstallmentDate: string;
  paymentsMade: number;
};

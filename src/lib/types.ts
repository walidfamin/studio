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

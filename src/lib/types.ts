export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
  type: 'budget' | 'loan' | 'tracking';
  negative?: boolean;
}

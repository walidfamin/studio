import type { Transaction, Account } from './types';

export const transactions: Transaction[] = [
  {
    id: 'txn_1',
    date: '2024-07-15',
    description: 'Starbucks',
    amount: 5.75,
    type: 'expense',
    category: 'Food & Drink',
  },
  {
    id: 'txn_2',
    date: '2024-07-15',
    description: 'Paycheck',
    amount: 2500,
    type: 'income',
    category: 'Salary',
  },
  {
    id: 'txn_3',
    date: '2024-07-14',
    description: 'Amazon Purchase',
    amount: 78.50,
    type: 'expense',
    category: 'Shopping',
  },
  {
    id: 'txn_4',
    date: '2024-07-13',
    description: 'Vanguard ETF',
    amount: 500,
    type: 'expense',
    category: 'Investments',
  },
  {
    id: 'txn_5',
    date: '2024-07-12',
    description: 'Whole Foods',
    amount: 124.30,
    type: 'expense',
    category: 'Groceries',
  },
    {
    id: 'txn_6',
    date: '2024-07-11',
    description: 'Uber ride',
    amount: 22.10,
    type: 'expense',
    category: 'Transportation',
  },
    {
    id: 'txn_7',
    date: '2024-06-28',
    description: 'Paycheck',
    amount: 2500,
    type: 'income',
    category: 'Salary',
  },
    {
    id: 'txn_8',
    date: '2024-06-25',
    description: 'Netflix Subscription',
    amount: 15.99,
    type: 'expense',
    category: 'Entertainment',
  },
];

export const spendingData = [
  { month: 'Jan', income: 4000, expenses: 2200 },
  { month: 'Feb', income: 4200, expenses: 2500 },
  { month: 'Mar', income: 4500, expenses: 2300 },
  { month: 'Apr', income: 4300, expenses: 2800 },
  { month: 'May', income: 4800, expenses: 2600 },
  { month: 'Jun', income: 5000, expenses: 3000 },
  { month: 'Jul', income: 5350, expenses: 2750 },
];

export const categorySpending = [
  { category: 'Groceries', value: 450, fill: 'hsl(var(--chart-1))' },
  { category: 'Shopping', value: 300, fill: 'hsl(var(--chart-2))' },
  { category: 'Transportation', value: 200, fill: 'hsl(var(--chart-3))' },
  { category: 'Entertainment', value: 150, fill: 'hsl(var(--chart-4))' },
  { category: 'Food & Drink', value: 250, fill: 'hsl(var(--chart-5))' },
]

export const accounts: Account[] = [
    { id: 'acc_1', name: 'Checking', balance: 4850.75, type: 'bank' },
    { id: 'acc_2', name: 'Savings', balance: 12345.67, type: 'bank' },
    { id: 'acc_3', name: 'Primary Credit', balance: -2750.00, type: 'credit' },
    { id: 'acc_4', name: 'Brokerage', balance: 7500.00, type: 'investment' },
];

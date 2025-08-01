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
  { category: 'Rent/Mortgage', value: 1000, fill: 'hsl(var(--chart-1))' },
  { category: 'Groceries', value: 465, fill: 'hsl(var(--chart-3))' },
  { category: 'Electric', value: 85, fill: 'hsl(var(--chart-2))' },
  { category: 'Transportation', value: 70, fill: 'hsl(var(--chart-4))' },
  { category: 'Phone', value: 70, fill: 'hsl(var(--chart-5))' },
  { category: 'TV', value: 5, fill: 'hsl(var(--muted))' },
]

export const accounts: Account[] = [
    { id: 'acc_1', name: 'Checking Account', balance: 3475.00, type: 'budget' },
    { id: 'acc_2', name: 'Savings Account', balance: 4700.00, type: 'budget' },
    { id: 'acc_3', name: 'Credit Card', balance: -3300.00, type: 'budget', negative: true },

    { id: 'loan_1', name: 'Mortgage', balance: -260000.00, type: 'loan', negative: true },
    { id: 'loan_2', name: 'Prius Loan', balance: -13500.00, type: 'loan', negative: true },
    { id: 'loan_3', name: 'Jeep Loan', balance: -18700.00, type: 'loan', negative: true },
    { id: 'loan_4', name: 'T\'s Student Loans', balance: -7800.00, type: 'loan', negative: true },
    { id: 'loan_5', name: 'M\'s Student Loans', balance: -17400.00, type: 'loan', negative: true },

    { id: 'track_1', name: 'T\'s Retirement Account', balance: 22000.00, type: 'tracking' },
    { id: 'track_2', name: 'M\'s 401K', balance: 12577.00, type: 'tracking' },
    { id: 'track_3', name: 'Home Value', balance: 350000.00, type: 'tracking' },
];

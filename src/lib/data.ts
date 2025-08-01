import type { Transaction, Account } from './types';

export const transactions: Transaction[] = [
  {
    id: 'txn_1',
    date: '2024-07-15',
    description: 'Starbucks',
    amount: 5.75,
    type: 'expense',
    category: 'Food & Drink',
    accountId: 'adcb_current'
  },
  {
    id: 'txn_2',
    date: '2024-07-15',
    description: 'Paycheck',
    amount: 2500,
    type: 'income',
    category: 'Salary',
    accountId: 'adcb_current'
  },
  {
    id: 'txn_3',
    date: '2024-07-14',
    description: 'Amazon Purchase',
    amount: 78.50,
    type: 'expense',
    category: 'Shopping',
    accountId: 'adcb_credit'
  },
  {
    id: 'txn_4',
    date: '2024-07-13',
    description: 'Vanguard ETF',
    amount: 500,
    type: 'expense',
    category: 'Investments',
    accountId: 'adcb_saving'
  },
  {
    id: 'txn_5',
    date: '2024-07-12',
    description: 'Whole Foods',
    amount: 124.30,
    type: 'expense',
    category: 'Groceries',
    accountId: 'adcb_current'
  },
    {
    id: 'txn_6',
    date: '2024-07-11',
    description: 'Uber ride',
    amount: 22.10,
    type: 'expense',
    category: 'Transportation',
    accountId: 'fab_current'
  },
    {
    id: 'txn_7',
    date: '2024-06-28',
    description: 'Paycheck',
    amount: 2500,
    type: 'income',
    category: 'Salary',
    accountId: 'rak_current'
  },
    {
    id: 'txn_8',
    date: '2024-06-25',
    description: 'Netflix Subscription',
    amount: 15.99,
    type: 'expense',
    category: 'Entertainment',
    accountId: 'adcb_credit'
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
    // ADCB Accounts
    { id: 'adcb_credit', name: 'Credit Card', balance: -3300.00, type: 'Credit Card', bank: 'ADCB' },
    { id: 'adcb_saving', name: 'Saving Account', balance: 4700.00, type: 'Saving Account', bank: 'ADCB' },
    { id: 'adcb_current', name: 'Current Account', balance: 3475.00, type: 'Current Account', bank: 'ADCB' },
    { id: 'adcb_esaving', name: 'E Saving Account', balance: 12500.00, type: 'E Saving Account', bank: 'ADCB' },

    // FAB BANK Accounts
    { id: 'fab_current', name: 'Current Account', balance: 8250.00, type: 'Current Account', bank: 'FAB BANK' },

    // RAK BANK Accounts
    { id: 'rak_current', name: 'Current Account', balance: 1500.00, type: 'Current Account', bank: 'RAK BANK' },
];

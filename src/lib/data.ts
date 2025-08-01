import type { Transaction } from './types';

export const transactions: Transaction[] = [
  {
    id: 'txn_1',
    date: 'July 15, 2024',
    description: 'Starbucks',
    amount: 5.75,
    type: 'expense',
    category: 'Food',
  },
  {
    id: 'txn_2',
    date: 'July 15, 2024',
    description: 'Paycheck',
    amount: 2500,
    type: 'income',
    category: 'Salary',
  },
  {
    id: 'txn_3',
    date: 'July 14, 2024',
    description: 'Amazon Purchase',
    amount: 78.50,
    type: 'expense',
    category: 'Spends',
  },
  {
    id: 'txn_4',
    date: 'July 13, 2024',
    description: 'Vanguard ETF',
    amount: 500,
    type: 'expense',
    category: 'Investment',
  },
  {
    id: 'txn_5',
    date: 'July 12, 2024',
    description: 'Whole Foods',
    amount: 124.30,
    type: 'expense',
    category: 'Lifestyle',
  },
    {
    id: 'txn_6',
    date: 'July 11, 2024',
    description: 'Uber ride',
    amount: 22.10,
    type: 'expense',
    category: 'Transportation',
  },
];

export const spendingData = [
  { name: 'Jan', lifestyle: 1200, investment: 500, spends: 800 },
  { name: 'Feb', lifestyle: 1300, investment: 600, spends: 750 },
  { name: 'Mar', lifestyle: 1100, investment: 550, spends: 900 },
  { name: 'Apr', lifestyle: 1400, investment: 700, spends: 850 },
  { name: 'May', lifestyle: 1500, investment: 750, spends: 950 },
  { name: 'Jun', lifestyle: 1600, investment: 800, spends: 1000 },
  { name: 'Jul', lifestyle: 1450, investment: 650, spends: 1100 },
];

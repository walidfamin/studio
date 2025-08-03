
import type { Transaction, Account, Investment } from './types';

export let transactions: Transaction[] = [];

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
    { id: 'adcb_credit', name: 'Credit Card', balance: 0, type: 'Credit Card', bank: 'ADCB' },
    { id: 'adcb_saving', name: 'Saving Account', balance: 0, type: 'Saving Account', bank: 'ADCB' },
    { id: 'adcb_current', name: 'Current Account', balance: 0, type: 'Current Account', bank: 'ADCB' },
    { id: 'adcb_esaving', name: 'E Saving Account', balance: 0, type: 'E Saving Account', bank: 'ADCB' },

    // FAB BANK Accounts
    { id: 'fab_current', name: 'Current Account', balance: 0, type: 'Current Account', bank: 'FAB BANK' },

    // RAK BANK Accounts
    { id: 'rak_current', name: 'Current Account', balance: 0, type: 'Current Account', bank: 'RAK BANK' },
];

export let investments: Investment[] = [
    { id: 'inv1', name: 'Villa in Project' },
    { id: 'inv2', name: 'Startup Fund' },
];


export function addInvestment(investment: Omit<Investment, 'id'>) {
    const newInvestment: Investment = {
        ...investment,
        id: `inv_${Date.now()}`
    };
    investments.push(newInvestment);
    return newInvestment;
}

const createTransactionId = (t: Omit<Transaction, 'id' | 'date'> & { date: Date }): string => {
    const datePart = t.date.toISOString().split('T')[0];
    const amountPart = t.amount.toFixed(2);
    const descHash = t.description.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `${datePart}_${amountPart}_${t.type}_${descHash}`;
};

export function addTransaction(transaction: Omit<Transaction, 'id' | 'date'> & { date: Date }) {
    const newTransaction: Transaction = {
        ...transaction,
        id: createTransactionId(transaction),
        date: transaction.date.toISOString(),
    };
    
    // Prevent duplicates by checking for existing ID
    const existingIndex = transactions.findIndex(t => t.id === newTransaction.id);
    if (existingIndex !== -1) {
        transactions[existingIndex] = newTransaction; // Update existing
    } else {
        transactions.unshift(newTransaction); // Add new
    }

    return newTransaction;
}

export function deleteTransactions(ids: string[]) {
    transactions = transactions.filter(t => !ids.includes(t.id));
}
    

    
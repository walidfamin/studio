import type { Transaction, Account, Property } from './types';

export const transactions: Transaction[] = [];

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

export let properties: Property[] = [
    {
        id: 'prop1',
        name: 'Downtown Apartment',
        location: 'Dubai, UAE',
        totalValue: 1200000,
        downPayment: 240000,
        paymentType: 'mortgage',
        loanAmount: 960000,
        installmentAmount: 5500,
        nextInstallmentDate: '2024-08-01T00:00:00.000Z',
        paymentsMade: 55000,
        paymentPlan: [
            { date: '2024-08-01', amount: 5500, status: 'unpaid' },
            { date: '2024-09-01', amount: 5500, status: 'unpaid' },
            { date: '2024-10-01', amount: 5500, status: 'unpaid' },
        ]
    }
];

export function addProperty(property: Omit<Property, 'id'>) {
    const newProperty: Property = {
        ...property,
        id: `prop_${Date.now()}`
    };
    properties.push(newProperty);
    return newProperty;
}

export function updateProperty(propertyId: string, updatedProperty: Partial<Property>) {
    properties = properties.map(p => p.id === propertyId ? { ...p, ...updatedProperty } : p);
}
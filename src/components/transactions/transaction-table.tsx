
'use client'

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { ArrowUpDown, ChevronDown, Download, Edit, Trash2 } from 'lucide-react';
import { AddTransactionSheet } from '../add-transaction-sheet';
import { Checkbox } from '../ui/checkbox';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { deleteTransactions, transactions as globalTransactions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function TransactionTable({ transactions, onEdit, setTransactions: setData }: { transactions: Transaction[], onEdit?: (transaction: Transaction) => void, setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>> }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    "balance": false, // Hidden by default
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const { toast } = useToast();

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
        accessorKey: 'date',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="pl-4">{format(new Date(row.getValue('date')), 'dd MMM yyyy')}</div>,
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        accessorKey: 'category',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="pl-4">{row.getValue("category")}</div>,
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row, table }) => {
        const transaction = row.original;
        const currentAssignee = transaction.assignedTo || 'Walid';
        
        const handleAssigneeChange = (newAssignee: 'Walid' | 'Nathalie' | 'Company') => {
          // Update local state if setData is provided
          if (setData) {
            setData(prev => {
                const index = prev.findIndex(t => t.id === transaction.id);
                if (index !== -1) {
                    const newData = [...prev];
                    newData[index] = { ...newData[index], assignedTo: newAssignee };
                    return newData;
                }
                return prev;
            });
          }
          
          // Also update the global state
          const globalIndex = globalTransactions.findIndex(t => t.id === transaction.id);
          if (globalIndex !== -1) {
              globalTransactions[globalIndex].assignedTo = newAssignee;
          }
        }

        return (
          <Select onValueChange={handleAssigneeChange} defaultValue={currentAssignee}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Assign to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Walid">Walid</SelectItem>
              <SelectItem value="Nathalie">Nathalie</SelectItem>
              <SelectItem value="Company">Company</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            return <Badge variant={type === 'income' ? 'default' : 'secondary'}>{type}</Badge>
        }
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => (
          <div className="text-right">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('amount'));
            const type = row.original.type;
            const value = type === 'expense' ? -amount : amount;

            return <div className={`text-right font-medium pr-4 ${value > 0 ? 'text-green-600' : ''}`}>{formatCurrency(value)}</div>
        }
    },
    {
        accessorKey: 'balance',
        header: ({ column }) => (
          <div className="text-right">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Balance
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
            const balance = row.getValue('balance');
            if (typeof balance !== 'number') {
                return <div className="text-right font-medium pr-4 text-muted-foreground">N/A</div>;
            }
            return <div className="text-right font-medium pr-4">{formatCurrency(balance as number)}</div>
        }
    },
    ...(onEdit ? [{
        id: 'actions',
        cell: ({ row }: { row: any }) => (
            <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                <Edit className="h-4 w-4" />
            </Button>
        ),
    }] : [])
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
        pagination: {
            pageSize: 100,
        }
    }
  });

  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(transactions.map(t => t.category));
    return Array.from(uniqueCategories);
  }, [transactions]);

  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
        return;
    }
    const dataToExport = selectedRows.map(row => row.original);
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Transactions");
    XLSX.writeFile(workbook, "selected_transactions.xlsx");
  };

  const handleDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      return;
    }
    const idsToDelete = selectedRows.map(row => row.original.id);
    
    if (setData) { // If it's a stateful component
        setData(prev => prev.filter(t => !idsToDelete.includes(t.id)))
    } else { // Fallback to mutating global data if not stateful
        deleteTransactions(idsToDelete);
    }
    
    table.resetRowSelection();
    toast({
        title: "Transactions Deleted",
        description: `${idsToDelete.length} transaction(s) have been deleted.`,
    })
  };
  
  const selectedTotal = React.useMemo(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    return selectedRows.reduce((total, row) => {
        const amount = parseFloat(row.getValue('amount'));
        const type = row.original.type;
        const value = type === 'expense' ? -amount : amount;
        return total + value;
    }, 0);
  }, [rowSelection, table]);


  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by description..."
          value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Category <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={!table.getColumn('category')?.getFilterValue()}
                  onCheckedChange={() => table.getColumn('category')?.setFilterValue(undefined)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={table.getColumn('category')?.getFilterValue() === category}
                    onCheckedChange={() => table.getColumn('category')?.setFilterValue(category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                    return (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                        }
                    >
                        {column.id}
                    </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
            </DropdownMenu>
            <AddTransactionSheet />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-4">
                <span>
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getCoreRowModel().rows.length} row(s) selected.
                </span>
                <span className="font-bold">Total: {formatCurrency(selectedTotal)}</span>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4"/>
                    Export Selected
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected 
                            {table.getFilteredSelectedRowModel().rows.length} transaction(s).
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            )
          }
        </div>
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
             <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                }}
                >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

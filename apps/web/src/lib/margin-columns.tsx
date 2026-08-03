import { computeMarginPercent } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { type ColumnDef } from '@tanstack/react-table';

type RateRow = {
  payRate: number;
  billRate: number;
  currency: string;
};

export function marginColumns<T extends RateRow>(): ColumnDef<T>[] {
  return [
    {
      id: 'payRate',
      header: 'Pay Rate',
      accessorFn: (row) => row.payRate,
      cell: ({ row }) =>
        `${formatCurrency(row.original.payRate, row.original.currency)}/hr`,
    },
    {
      id: 'billRate',
      header: 'Bill Rate',
      accessorFn: (row) => row.billRate,
      cell: ({ row }) =>
        `${formatCurrency(row.original.billRate, row.original.currency)}/hr`,
    },
    {
      id: 'margin',
      header: 'Margin',
      accessorFn: (row) => computeMarginPercent(row.payRate, row.billRate),
      cell: ({ row }) => {
        const margin = computeMarginPercent(row.original.payRate, row.original.billRate);
        return <span className="font-medium text-success">{margin}%</span>;
      },
    },
  ];
}

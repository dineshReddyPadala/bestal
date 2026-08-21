import { cn } from '@bestal/shared-utils';
import { type HTMLAttributes, type ReactNode, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';

export type DataTableProps = HTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
};

export function DataTable({ className, children, ...props }: DataTableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function DataTableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-border bg-[var(--shell-table-muted)] [&_tr]:bg-[var(--shell-table-muted)] [&_tr:hover]:bg-[var(--shell-table-muted)]',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        '[&_tr:last-child]:border-0 [&_tr]:bg-white [&_tr:hover]:bg-[var(--shell-table-row-hover)]',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-b border-border bg-white transition-colors hover:bg-[var(--shell-table-row-hover)]', className)}
      {...props}
    />
  );
}

export function DataTableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 bg-[var(--shell-table-muted)] px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('bg-inherit px-4 py-3 align-middle text-foreground', className)}
      {...props}
    />
  );
}

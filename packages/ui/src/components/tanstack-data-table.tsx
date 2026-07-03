import { cn } from '@bestal/shared-utils';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { Button } from './button.js';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from './data-table.js';
import { EmptyState } from './empty-state.js';
import { SearchInput } from './search-input.js';

export type TanStackDataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  bulkActions?: (selectedRows: TData[]) => ReactNode;
  stickyHeader?: boolean;
  globalFilterFn?: (row: { original: TData }, columnId: string, filterValue: string) => boolean;
};

export function TanStackDataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  toolbar,
  filters,
  footer,
  onRowClick,
  enableRowSelection = false,
  getRowId,
  bulkActions,
  stickyHeader = false,
  globalFilterFn,
}: TanStackDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
    getRowId,
    globalFilterFn: globalFilterFn as never,
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          onClear={() => setGlobalFilter('')}
          className="max-w-sm"
        />
        {toolbar}
      </div>

      {filters}

      {enableRowSelection && selectedRows.length > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedRows.length} selected
          </span>
          {bulkActions(selectedRows)}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <DataTable>
          <DataTableHeader className={cn(stickyHeader && 'sticky top-0 z-10')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <DataTableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <DataTableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </DataTableHead>
                ))}
              </DataTableRow>
            ))}
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <DataTableRow
                key={row.id}
                className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                onClick={() => onRowClick?.(row.original)}
                data-state={row.getIsSelected() ? 'selected' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <DataTableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </DataTableCell>
                ))}
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}

      {rows.length > 0 && (
        footer ?? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              {' · '}
              {table.getFilteredRowModel().rows.length} row
              {table.getFilteredRowModel().rows.length === 1 ? '' : 's'}
            </span>
            <div className="flex gap-2">
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
        )
      )}
    </div>
  );
}

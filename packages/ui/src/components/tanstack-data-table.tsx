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
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from './data-table.js';
import { EmptyState } from './empty-state.js';
import { SearchInput } from './search-input.js';

export type TanStackColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

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
  /** Fill parent height: table body scrolls, pagination stays pinned. */
  fillHeight?: boolean;
  dense?: boolean;
  /** Render search and filters on one horizontal row. */
  filtersInline?: boolean;
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
  fillHeight = false,
  dense = false,
  filtersInline = false,
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
    globalFilterFn:
      (globalFilterFn as never) ??
      ((row, _columnId, filterValue) => {
        const q = String(filterValue ?? '')
          .toLowerCase()
          .trim();
        if (!q) return true;
        const original = row.original as Record<string, unknown>;
        return Object.values(original).some((value) => {
          if (value == null || typeof value === 'object') return false;
          return String(value).toLowerCase().includes(q);
        });
      }),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;

  const paginationBar = (
    <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-1 py-3 text-sm text-muted-foreground">
      <span>
        Page {pageIndex + 1} of {pageCount}
        {' · '}
        Showing {totalFiltered} row{totalFiltered === 1 ? '' : 's'}
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
  );

  return (
    <div
      className={cn(
        fillHeight ? 'flex h-full min-h-0 flex-col gap-3' : 'space-y-4',
      )}
    >
      {filtersInline ? (
        <div className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-2">
          <div className="flex w-full min-w-[10rem] max-w-xs shrink-0 flex-col gap-1 sm:w-52">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-transparent select-none">
              Search
            </span>
            <SearchInput
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              onClear={() => setGlobalFilter('')}
              className="w-full"
            />
          </div>
          {filters}
          {toolbar ? (
            <div className="flex shrink-0 flex-col gap-1 sm:ml-auto">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-transparent select-none">
                Actions
              </span>
              <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex shrink-0 flex-wrap items-end gap-3">
            <SearchInput
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              onClear={() => setGlobalFilter('')}
              className="w-full min-w-[10rem] max-w-xs sm:w-52"
            />
            {toolbar ? (
              <div className="flex shrink-0 flex-wrap items-end gap-2 sm:ml-auto">{toolbar}</div>
            ) : null}
          </div>
          {filters ? <div className="shrink-0">{filters}</div> : null}
        </>
      )}

      {enableRowSelection && selectedRows.length > 0 && bulkActions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">
            {selectedRows.length} selected
          </span>
          {bulkActions(selectedRows)}
        </div>
      )}

      {rows.length === 0 ? (
        <div className={cn(fillHeight && 'min-h-0 flex-1')}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div
          className={cn(
            'min-h-0 overflow-auto rounded-lg border border-border bg-background',
            fillHeight ? 'flex-1' : undefined,
          )}
        >
          <table className={cn('w-full caption-bottom text-sm', dense && 'text-[13px]')}>
            <DataTableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-muted/90 backdrop-blur')}>
              {table.getHeaderGroups().map((headerGroup) => (
                <DataTableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as TanStackColumnMeta | undefined;
                    return (
                      <DataTableHead
                        key={header.id}
                        className={cn(
                          'whitespace-nowrap',
                          dense && 'h-9 px-3',
                          meta?.headerClassName,
                        )}
                      >
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
                    );
                  })}
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
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as TanStackColumnMeta | undefined;
                    return (
                      <DataTableCell
                        key={cell.id}
                        className={cn(
                          'whitespace-nowrap',
                          dense && 'px-3 py-2',
                          meta?.cellClassName,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </DataTableCell>
                    );
                  })}
                </DataTableRow>
              ))}
            </DataTableBody>
          </table>
        </div>
      )}

      {rows.length > 0 && (footer ?? paginationBar)}
    </div>
  );
}

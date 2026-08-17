import { cn } from '@bestal/shared-utils';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
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
  /** Controlled search (e.g. server-side). When set, search box is controlled by the parent. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** When true, do not apply client-side text filtering (parent/server already filtered). */
  serverSideSearch?: boolean;
  /** Hide the built-in search field (e.g. when filters are provided externally). */
  hideSearch?: boolean;
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
  searchValue,
  onSearchChange,
  serverSideSearch = false,
  hideSearch = false,
}: TanStackDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalFilter, setInternalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const isSearchControlled = searchValue !== undefined;
  const globalFilter = isSearchControlled ? searchValue : internalFilter;

  const setGlobalFilter = (value: string) => {
    if (isSearchControlled) {
      onSearchChange?.(value);
    } else {
      setInternalFilter(value);
      onSearchChange?.(value);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === 'function' ? updater(globalFilter) : updater;
      setGlobalFilter(String(next ?? ''));
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
    getRowId,
    globalFilterFn: serverSideSearch
      ? (() => true as boolean)
      : ((globalFilterFn as never) ??
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
        })),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;

  const rangeStart = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, totalFiltered);

  const paginationBar = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between border-t border-border bg-background text-muted-foreground',
        dense ? 'min-h-8 px-2 py-1 text-xs' : 'min-h-9 px-3 py-1.5 text-xs',
      )}
    >
      <span className="tabular-nums">
        {rangeStart === rangeEnd
          ? `${rangeStart} of ${totalFiltered}`
          : `${rangeStart}–${rangeEnd} of ${totalFiltered}`}
      </span>
      <div className="-mr-1 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 px-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 px-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'min-w-0 w-full',
        fillHeight ? 'flex h-full min-h-0 flex-col gap-3' : 'space-y-4',
      )}
    >
      {filtersInline ? (
        <div className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-2">
          {!hideSearch ? (
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
          ) : null}
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
      ) : hideSearch && !toolbar && !filters ? null : (
        <>
          <div className="flex shrink-0 flex-wrap items-end gap-3">
            {!hideSearch ? (
              <SearchInput
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                onClear={() => setGlobalFilter('')}
                className="w-full min-w-[10rem] max-w-xs sm:w-52"
              />
            ) : null}
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
            'min-h-[200px] min-w-0 w-full overflow-x-auto overflow-y-auto rounded-lg border border-border bg-background sm:min-h-0',
            fillHeight ? 'sm:flex-1' : undefined,
          )}
        >
          <table className={cn('w-full min-w-max caption-bottom text-sm', dense && 'text-[13px]')}>
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

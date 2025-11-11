'use client';

import {
  type Table,
  type ColumnFiltersState,
  type RowData,
  type Column,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Columns, ChevronDown, Plus, X, ListFilter } from 'lucide-react';
import { useCallback, useState, useMemo } from 'react';
import { FIXED_FILTER_OPTIONS } from '@/utils/constraints';
import { convertSingular } from '@/utils';

interface DataTableToolbarProps<TData extends RowData> {
  table: Table<TData>;
  entityName: string;
  onAddClick?: () => void;
  sortFields?: readonly string[];
  serverFilterKeys?: (keyof TData)[];
  customFilterKey?: string;
}

const formatFieldName = (field: string): string =>
  field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const getFilterValue = (filters: ColumnFiltersState, key: string): string[] => {
  const f = filters.find((x) => x.id === key);
  return Array.isArray(f?.value) ? (f.value as string[]) : [];
};

export function DataTableToolbar<TData extends RowData>({
  table,
  entityName,
  onAddClick,
  serverFilterKeys = [],
  customFilterKey,
}: DataTableToolbarProps<TData>) {
  const [showFilter, setShowFilter] = useState(false);
  const [columnFilterSearch, setColumnFilterSearch] = useState<Record<string, string>>({});

  const handleGlobalFilterChange = (value: string) => table.setGlobalFilter(value);
  const handleColumnFiltersChange = (updater: any) => table.setColumnFilters(updater);

  const globalFilter = table.getState().globalFilter ?? '';
  const columnFilters = table.getState().columnFilters;
  const isFilterActive = !!globalFilter || columnFilters.length > 0;

  const handleFilterClick = useCallback(() => setShowFilter((p) => !p), []);
  const handleClearAllFilters = useCallback(() => {
    handleColumnFiltersChange([]);
    handleGlobalFilterChange('');
    setShowFilter(false);
  }, [handleColumnFiltersChange, handleGlobalFilterChange]);

  const handleFilterInputChange = useCallback(
    (columnId: string, value: string, isChecked: boolean) => {
      handleColumnFiltersChange((prev: ColumnFiltersState) => {
        const cur = getFilterValue(prev, columnId);
        const next = isChecked ? [...cur, value] : cur.filter((v) => v !== value);
        return next.length === 0
          ? prev.filter((f) => f.id !== columnId)
          : [...prev.filter((f) => f.id !== columnId), { id: columnId, value: next }];
      });
    },
    [handleColumnFiltersChange],
  );

  const getFilterButtonText = useCallback(
    (columnId: string): string => {
      const selected = getFilterValue(columnFilters, columnId);
      const header = formatFieldName(columnId);
      if (selected.length === 0) return header;
      if (selected.length <= 2) return selected.join(', ');
      return `${selected[0]}, ${selected[1]} (+${selected.length - 2})`;
    },
    [columnFilters],
  );

  const renderColumnVisibilityItems = useCallback(() => {
    const hideableColumns = table.getAllColumns().filter((col: any) => col.getCanHide());
    const visibleCount = hideableColumns.reduce(
      (count: number, col: any) => count + (col.getIsVisible() ? 1 : 0),
      0,
    );

    return hideableColumns.map((col: any) => {
      const isVisible = col.getIsVisible();
      const isLastVisible = isVisible && visibleCount === 1;

      return (
        <DropdownMenuCheckboxItem
          key={col.id}
          checked={isVisible}
          disabled={isLastVisible}
          onCheckedChange={(v) => col.toggleVisibility(!!v)}
          className="capitalize"
          title={isLastVisible ? 'At least one column must remain visible' : undefined}
        >
          {formatFieldName(col.id ?? '')}
        </DropdownMenuCheckboxItem>
      );
    });
  }, [table]);

  const filterableColumns = useMemo(() => {
    const availableColumns = table.getAllColumns();

    const existingFilterColumns = availableColumns.filter(
      (c) => c.getCanFilter() && c.columnDef.filterFn === 'arrIncludesSome' && c.id !== 'select',
    );

    const existingColumnIds = existingFilterColumns.map((c) => c.id);
    const missingFilterKeys = serverFilterKeys.filter(
      (key) => !existingColumnIds.includes(key as string),
    );

    const virtualColumns: Column<TData, unknown>[] = missingFilterKeys.map((key) => {
      const columnInstance = table.getColumn(key as string);
      return {
        id: key as string,
        getCanFilter: () => true,
        getFacetedUniqueValues: () => columnInstance?.getFacetedUniqueValues() ?? new Map(),
        columnDef: { id: key, filterFn: 'arrIncludesSome' },
      } as unknown as Column<TData, unknown>;
    });

    return [...existingFilterColumns, ...virtualColumns];
  }, [table, serverFilterKeys]);

  return (
    <div className="flex flex-col gap-2 p-3 px-6 lg:px-8 flex-shrink-0 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{entityName}</h2>
        </div>

        <div className="flex items-center gap-2">
          {!showFilter && (
            <Input
              placeholder={`Search ${entityName}...`}
              value={globalFilter}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              className="max-w-sm"
            />
          )}

          <Button
            title="Filter"
            variant="outline"
            size="sm"
            className={`cursor-pointer flex items-center gap-1 ${showFilter ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            onClick={handleFilterClick}
          >
            <ListFilter className="h-3 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Columns className="h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-gray-700 text-gray-50 border-gray-600 max-h-60 overflow-auto"
            >
              {renderColumnVisibilityItems()}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAddClick && (
            <Button
              variant="outline"
              size="sm"
              className="flex hover:text-white items-center gap-1 bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">{`Add ${convertSingular(entityName)}`}</span>
            </Button>
          )}
        </div>
      </div>

      {showFilter && (
        <div className="flex items-center gap-4 p-2 px-4 mt-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-1 w-full max-w-[200px] flex-shrink-0">
            <ListFilter className="h-4 w-4 mr-2 text-gray-500" />
            <Input
              placeholder="Filter by keyword"
              value={globalFilter}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              className="border-none p-1 h-8 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex-grow min-w-0">
            {filterableColumns.map((column) => {
              const key = column.id!;
              const filterOptionsKey = key === 'type' && customFilterKey ? customFilterKey : key;
              const fixed = FIXED_FILTER_OPTIONS[customFilterKey || filterOptionsKey] || [];
              const isFixed = fixed.length > 0 || key === 'isArchived';

              const uniqueMap = column.getFacetedUniqueValues() ?? new Map();

              let options: string[] = [];

              if (key === 'isArchived') {
                options = FIXED_FILTER_OPTIONS.isArchived;
              } else if (isFixed) {
                options = fixed;
              } else {
                options = Array.from(uniqueMap.keys())
                  .filter((v): v is string => typeof v === 'string' && v !== '')
                  .sort();
              }

              const searchTerm = columnFilterSearch[key] ?? '';
              const finalOpts = options.filter((v) =>
                v.toLowerCase().includes(searchTerm.toLowerCase()),
              );
              const selected = getFilterValue(columnFilters, key);

              return (
                <DropdownMenu key={key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 flex items-center gap-1 flex-shrink-0 ${
                        selected.length > 0
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="truncate max-w-[150px]">{getFilterButtonText(key)}</span>
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
                    <div className="p-1 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                      <Input
                        placeholder={`Search ${formatFieldName(key)}...`}
                        className="h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={searchTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setColumnFilterSearch((p) => ({ ...p, [key]: e.target.value }));
                        }}
                      />
                    </div>

                    {selected.length > 0 && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleColumnFiltersChange((prev: ColumnFiltersState) =>
                            prev.filter((f) => f.id !== key),
                          )
                        }
                        className="text-red-500 font-medium"
                      >
                        Clear Filter
                      </DropdownMenuItem>
                    )}

                    {finalOpts.map((value) => {
                      const count = isFixed ? 0 : (uniqueMap.get(value) ?? 0);
                      const checked = selected.includes(value);
                      return (
                        <DropdownMenuCheckboxItem
                          key={value}
                          checked={checked}
                          onCheckedChange={(v) => handleFilterInputChange(key, value, v)}
                          className="w-full justify-between"
                        >
                          <span className="truncate">{value}</span>
                          {!isFixed && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({count})
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>

          {isFilterActive && (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex-shrink-0"
              onClick={handleClearAllFilters}
              title="Clear all filters & search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

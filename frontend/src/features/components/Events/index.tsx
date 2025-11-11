import React, { useState, useEffect, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import auditLogservice from '@/utils/services/events';
import type { EventLogItem, AuditLogData } from '@/types/index';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CustomTable } from '@/features/components/CustomTable';
import { formatDialogTimestamp } from './utils';
import { useAppDispatch } from '@/app/hooks';
import { globalSliceActions } from '@/features/redux/slice';

const AuditEventsPage: React.FC = () => {
  const [logs, setLogs] = useState<EventLogItem[]>([]);
  const [fullLogs, setFullLogs] = useState<AuditLogData[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const currentPage = pagination.pageIndex + 1;
  const itemsPerPage = pagination.pageSize;
  const dispatch = useAppDispatch();
  useEffect(() => {
    const loadLogs = async () => {
      dispatch(globalSliceActions.setLoader(true));
      try {
        const {
          logs: fetchedLogs,
          rawLogs: fetchedRawLogs,
          total,
        } = await auditLogservice.getPaginated({ page: currentPage, limit: itemsPerPage });

        setLogs(fetchedLogs);
        setFullLogs(fetchedRawLogs);
        setTotalRecords(total);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
        setLogs([]);
        setFullLogs([]);
      }
      dispatch(globalSliceActions.setLoader(false));
    };

    loadLogs();
  }, [currentPage, itemsPerPage]);

  const openLogViewer = (logId: string) => {
    const logData = fullLogs.find((log) => log.id === logId);
    if (logData) {
      setSelectedLog(logData);
    }
  };

  const columns: ColumnDef<EventLogItem, any>[] = useMemo(() => {
    const columnHelper = createColumnHelper<EventLogItem>();

    return [
      columnHelper.accessor('account', {
        header: 'Entity',
        id: 'entity',
        size: 110,
        cell: ({ row }) => {
          const entityName = row.original.account;
          return (
            <div className="font-mono text-sm px-3">
              <span className="font-semibold">{entityName}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('event', {
        header: 'Action',
        size: 100,
        cell: ({ row }) => <div className="font-mono text-sm px-3">{row.original.event}</div>,
      }),
      columnHelper.accessor('data', {
        header: 'Data',
        size: 400,
        cell: ({ row }) => (
          <div className="font-mono text-sm px-2 truncate">{row.original.data}</div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        id: 'userAndDate',
        size: 200,
        cell: ({ row }) => (
          <div className="text-gray-700">
            <div className="flex flex-col text-sm px-2">
              <span className="font-semibold">{row.original.createdBy}</span>
              <span className="text-xs text-gray-500">{row.original.createdAt}</span>
            </div>
          </div>
        ),
      }),
    ];
  }, [openLogViewer]);

  const renderStyledJson = useMemo(() => {
    if (!selectedLog) return <p className="text-white">Log data unavailable.</p>;

    const jsonString = JSON.stringify(selectedLog, null, 2);
    const KEY_COLOR_CLASS = 'text-blue-300';
    const STRING_VALUE_COLOR_CLASS = 'text-orange-300';
    const PRIMITIVE_COLOR_CLASS = 'text-purple-400';

    let htmlContent = jsonString;

    htmlContent = htmlContent.replace(
      /^(\s*)(".*?")(\s*):/gm,
      `$1<span class="${KEY_COLOR_CLASS}">$2</span>$3:`,
    );
    htmlContent = htmlContent.replace(
      /(:\s*)(".*?[^\\]")(\s*(?:,)?)/g,
      `$1<span class="${STRING_VALUE_COLOR_CLASS}">$2</span>$3`,
    );
    htmlContent = htmlContent.replace(
      /(:\s*)(null|true|false|[-]?\d+\.?\d*)/g,
      `$1<span class="${PRIMITIVE_COLOR_CLASS}">$2</span>`,
    );

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }, [selectedLog]);

  const onPaginationChange = (updater: any) => {
    setPagination((old) => {
      const newPagination = typeof updater === 'function' ? updater(old) : updater;
      return { pageIndex: newPagination.pageIndex, pageSize: newPagination.pageSize };
    });
  };

  const onRowClick = (row: EventLogItem) => {
    openLogViewer(row.id);
  };

  return (
    <div className="p-6 bg-whiteflex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
      </div>
      <div className="relative flex-1 overflow-hidden min-h-0">
        <CustomTable<EventLogItem>
          data={logs}
          columns={columns}
          totalRows={totalRecords}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          enableRowSelection={false}
          onRowClick={onRowClick}
          rowIdKey={'id'}
          className="h-[calc(100vh-200px)]"
        />
      </div>
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-[480px] max-h-[80vh] flex flex-col p-4 border-0 shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-start text-sm font-mono text-gray-600 ">
              <div className="flex flex-col">
                <span className="text-violet-700 font-bold">
                  {selectedLog?.entity.toLowerCase()}.{selectedLog?.action.toLowerCase()}
                </span>
                <span className="font-normal text-gray-500 text-xs mt-1">
                  {formatDialogTimestamp(selectedLog?.createdAt)}
                </span>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className=" text-gray-400 hover:text-gray-600 focus:outline-none -mt-2 -mr-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-900 text-gray-200 p-6 pt-2 font-mono text-xs leading-5">
            <pre className="whitespace-pre-wrap break-words">{renderStyledJson}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditEventsPage;

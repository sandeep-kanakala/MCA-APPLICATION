import { Dialog, DialogContent } from '@/components/ui/dialog';
import React, { useMemo, useState } from 'react';
import { formatDialogTimestamp } from '../Events/utils';
import { Plus, Pen, Trash2, Activity } from 'lucide-react';
import type { ActivityLogsProps, IActivity } from './utils';

const ActivityLogs: React.FC<ActivityLogsProps> = ({ activities, entity }) => {
  const [selectedLog, setSelectedLog] = useState<IActivity | null>(null);

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return <Plus className="h-5 w-5" />;
    if (actionLower.includes('update') || actionLower.includes('edit'))
      return <Pen className="h-5 w-5" />;
    if (actionLower.includes('delete')) return <Trash2 className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const getActionColors = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) {
      return {
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        ringColor: 'ring-white',
      };
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return {
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        ringColor: 'ring-white',
      };
    }
    if (actionLower.includes('delete')) {
      return {
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        ringColor: 'ring-white',
      };
    }
    return {
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      ringColor: 'ring-white',
    };
  };

  const renderStyledJson = useMemo(() => {
    if (!selectedLog) return <p className="text-white">Log data unavailable.</p>;

    const jsonString = JSON.stringify(selectedLog, null, 2);
    const KEY_COLOR_CLASS = 'text-blue-300';
    const STRING_VALUE_COLOR_CLASS = 'text-orange-300';
    const PRIMITIVE_COLOR_CLASS = 'text-purple-400';

    let htmlContent = jsonString;

    htmlContent = htmlContent.replace(
      /^(\s*)(".*?")(\s*):/gm,
      `$1<span class="${KEY_COLOR_CLASS}">$2$3:</span>`,
    );
    htmlContent = htmlContent.replace(
      /(:\s*)(".*?[^\\]")(\s*(?:,)?)/g,
      `$1<span class="${STRING_VALUE_COLOR_CLASS}">$2$3</span>`,
    );
    htmlContent = htmlContent.replace(
      /(:\s*)(null|true|false|[-]?\d+\.?\d*)/g,
      `$1<span class="${PRIMITIVE_COLOR_CLASS}">$2</span>`,
    );

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }, [selectedLog]);

  const openLogViewer = (logId: string) => {
    const logData = activities.find((log) => log.id === logId);
    if (logData) {
      setSelectedLog(logData);
    }
  };

  return (
    <div className="mb-0">
      <div className="flow-root">
        <ul className="-mb-8">
          {activities &&
            activities.map((activity, index) => {
              const colors = getActionColors(activity.action);
              const icon = getActionIcon(activity.action);
              const isLast = index === activities.length - 1;

              return (
                <li key={activity.id}>
                  <div className={`relative ${!isLast ? 'pb-8' : ''}`}>
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute top-5 left-[1.25rem] h-[calc(100%-20px)] w-0.5 bg-gray-200"
                      />
                    )}

                    <div className="relative flex items-center space-x-4">
                      <div className="relative">
                        <span
                          className={`h-10 w-10 rounded-full ${colors.bgColor} flex items-center justify-center ring-8 ${colors.ringColor}`}
                        >
                          <span className={colors.iconColor}>{icon}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openLogViewer(activity.id)}
                        className="min-w-0 flex-1 text-left cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-xs font-medium text-gray-900">
                              {entity} {activity.action.toLowerCase() + 'd'}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            by{' '}
                            <span className="font-medium text-gray-900">
                              {activity.performedBy}
                            </span>
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-[480px] max-h-[80vh] flex flex-col border-0 shadow-2xl overflow-hidden p-0"
        >
          <div className="px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center text-sm font-mono text-gray-600">
              <div className="flex flex-col">
                <span className="text-violet-700 font-bold">
                  {selectedLog?.action.toLowerCase()}
                </span>

                <span className="font-normal text-gray-500 text-sm">
                  {formatDialogTimestamp(selectedLog?.timestamp)}
                </span>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none -mt-2 -mr-2"
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

export default ActivityLogs;

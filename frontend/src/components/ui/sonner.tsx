'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps, toast as sonnerToast } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      icons={{
        success: <CircleCheckIcon className="w-5 h-5" />,
        info: <InfoIcon className="w-5 h-5" />,
        warning: <TriangleAlertIcon className="w-5 h-5" />,
        error: <OctagonXIcon className="w-5 h-5" />,
        loading: <Loader2Icon className="w-5 h-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!w-auto !max-w-[90vw] !inline-flex !items-center !px-4 !py-2 !rounded-xl !shadow-lg',
          success: '!text-green-500',
          info: ' !tetx-blue-500',
          warning: '!text-yellow-500',
          error: '!text-red-600',
          loading: '!text-yellow-600',
        },
      }}
      style={
        {
          '--border-radius': 'var(--radius)',
          whiteSpace: 'pre-line',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

//  Re-export Sonner toast directly
export const toast = sonnerToast;

export { Toaster };

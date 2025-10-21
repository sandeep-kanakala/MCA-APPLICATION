import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import type { ReactNode } from 'react';
import { useState } from 'react';
import '@/index.css';

interface DrawerDirectionsProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  onActionClick?: (onClose: () => void) => void; 
  actionButtonLabel?: string;
  isSubmitting?: boolean;
  trigger?: ReactNode;
}

export default function DrawerDirections({
  title = 'Right Drawer',
  description = 'This drawer slides in from the right.',
  children,
  onActionClick,
  actionButtonLabel = 'Save Changes',
  isSubmitting = false,
  trigger,
}: DrawerDirectionsProps) {
  const [open, setOpen] = useState(false);
  
  const onClose = () => setOpen(false);

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(onClose); 
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        {trigger || <Button variant="outline">Open Drawer</Button>}
      </DrawerTrigger>

      <div className="flex flex-col md:flex-row">
        <DrawerContent className="!bg-white shadow-2xl border-l-gray-200 !w-1/2 !max-w-[90vw]">
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <DrawerHeader className="border-b border-gray-200 p-4 bg-white">
              <DrawerTitle className="text-foreground font-semibold">{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>

            {/* Drawer Body */}
            <div className="p-6 flex-1 bg-white overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{children}</div>
            </div>

            {/* Footer */}
            <DrawerFooter className="border-t border-gray-200 p-4 bg-white">
              <div className="flex w-full justify-end gap-3">
                <DrawerClose asChild>
                  <Button variant="outline" className="px-6 min-w-[100px] cursor-pointer">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  onClick={handleActionClick}
                  disabled={isSubmitting}
                  className="px-6 min-w-[140px] bg-primary cursor-pointer"
                >
                  {actionButtonLabel}
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </div>
    </Drawer>
  );
}
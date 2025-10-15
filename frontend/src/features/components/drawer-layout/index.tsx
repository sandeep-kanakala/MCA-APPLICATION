'use client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import type { ReactNode } from 'react';
import '@/index.css';

interface DrawerDirectionsProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  onSave?: () => void;
}

export default function DrawerDirections({
  title = 'Right Drawer',
  description = 'This drawer slides in from the right.',
  children,
  onSave,
}: DrawerDirectionsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>

        <div className="flex flex-col md:flex-row">
          <DrawerContent className="!bg-white shadow-2xl border-l-gray-200 !w-1/2 !max-w-[90vw]">
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <DrawerHeader className="border-b border-gray-200 p-4 bg-white">
                <DrawerTitle className="text-foreground font-semibold">{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
              </DrawerHeader>

              {/* Drawer Body — 2 column layout */}
              <div className="p-6 flex-1 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{children}</div>
              </div>

              {/* Footer */}
              <DrawerFooter className="border-t border-gray-200 p-4 bg-white">
                <div className="flex w-full justify-end gap-3">
                  <DrawerClose asChild>
                    <Button variant="outline" className="px-6 min-w-[100px]">
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button onClick={onSave} className="px-6 min-w-[140px] bg-primary">
                    Save & Continue
                  </Button>
                </div>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </div>
      </Drawer>
    </div>
  );
}

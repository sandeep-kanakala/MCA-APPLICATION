import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import DynamicBreadcrumb from '@/features/components/Breadcrumb';

export default function SideBar({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="!m-0 !rounded-none flex-1 flex flex-col h-full overflow-y-auto">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <DynamicBreadcrumb />
          </header>
          <main className="flex flex-1 flex-col gap-4  pt-0">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

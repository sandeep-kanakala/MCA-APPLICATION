import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './app-sidebar';
import DynamicBreadcrumb from '@/features/components/Breadcrumb';

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider className="">
      <div className="flex h-screen overflow-hidden">
        <div>
          {' '}
          <AppSidebar />
        </div>
        <SidebarInset className="!m-0 !rounded-none flex-1 flex flex-col  w-svw h-full overflow-y-auto">
          <header className="flex h-16 shrink-0 items-center gap-2 bg-white sticky top-0 z-20">
            <DynamicBreadcrumb />
          </header>

          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

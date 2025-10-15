import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex-1 w-full p-4">
          <SidebarTrigger className="bg-white p-2 mb-4" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

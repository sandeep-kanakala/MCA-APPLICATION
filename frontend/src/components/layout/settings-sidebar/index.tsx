import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';

export default function SideBar({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  function generateBreadcrumbs(pathname: string) {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((segment, index) => {
      const url = '/' + paths.slice(0, index + 1).join('/');
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name, url };
    });
  }
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center  px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <div className="flex">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <BreadcrumbItem key={crumb.url}>
                        {isLast ? (
                          <BreadcrumbPage className="font-bold">{crumb.name}</BreadcrumbPage>
                        ) : (
                          <>
                            <BreadcrumbLink asChild>
                              <Link to={crumb.url} className="font-bold">
                                {crumb.name}
                              </Link>
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                          </>
                        )}
                      </BreadcrumbItem>
                    );
                  })}
                </div>
              </BreadcrumbList>
            </Breadcrumb>
            <Breadcrumb></Breadcrumb>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

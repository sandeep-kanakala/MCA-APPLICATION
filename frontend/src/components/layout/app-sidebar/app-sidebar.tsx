import * as React from 'react';
import {
  Briefcase,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  CalendarDays,
  List,
  Book,
} from 'lucide-react';

import { NavSecondary } from '@/components/sideBar/nav-secondary';
import { NavUser } from '@/components/sideBar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { useUserRole } from '@/app/hooks';

const appsMenuItems = {
  items: [
    {
      title: 'Dashboard',
      url: '/apps/sales/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Accounts',
      url: 'apps/sales/accounts',
      icon: Briefcase,
    },
    {
      title: 'Contacts',
      url: 'apps/sales/contacts',
      icon: Users,
    },
    {
      title: 'Products',
      url: 'apps/sales/products',
      icon: ShoppingBag,
    },
    {
      title: 'Price Books',
      url: 'apps/sales/pricebooks',
      icon: Book,
    },
    {
      title: 'Price list',
      url: 'apps/sales/pricelist',
      icon: List,
    },
    {
      title: 'Orders',
      url: 'apps/sales/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Events',
      url: 'apps/sales/events',
      icon: CalendarDays,
    },
  ],
  navSecondary: [
    {
      title: 'Setting',
      url: '/setting/users',
      icon: Settings,
    },
  ],
};

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { data }: any = useUserRole();
  const firstLetter = data.email?.slice(0, 2).toUpperCase();

  const UserData = {
    name: firstLetter,
    email: `${data.email}`,
    avatar: '/avatars/shadcn.jpg',
  };
  // const isSettingsPage = currentPath.startsWith('/setting');
  const currentNav = appsMenuItems;

  const isActive = (path: string) => currentPath.includes(path);
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="mx-auto">
            <SidebarMenuButton size="lg" asChild>
              <Link to="/apps">
                <img
                  width={'70'}
                  alt="logo"
                  className=""
                  height={'77'}
                  src="/assets/logo-white.svg"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu className="cursor-pointer ">
            {currentNav?.items?.map((item: any) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`
          ${isActive(item?.url) ? 'bg-[#D4E2FD] text-[#274AFF] border-l-4 border-[#274AFF]' : 'text-gray-700'}
          hover:bg-[#D4E2FD] hover:text-[#274AFF] hover:border-l-4 hover:border-[#274AFF]
          transition-colors duration-200 rounded-none
        `}
                >
                  <Link
                    to={item.url}
                    className="flex items-center gap-2  text-gray-700
                  transition-colors duration-200"
                  >
                    <item.icon />
                    <span className="">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
        <NavSecondary items={currentNav.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="cursor-pointer">
        <NavUser user={UserData} />
      </SidebarFooter>
    </Sidebar>
  );
}

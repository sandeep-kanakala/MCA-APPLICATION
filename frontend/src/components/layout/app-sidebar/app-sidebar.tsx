'use client';

import * as React from 'react';
import {
  Briefcase,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
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

const appsMenuItems = {
  items: [
    {
      title: 'Dashboard',
      url: '/apps/sales/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Accounts',
      url: '/account',
      icon: Briefcase,
    },

    {
      title: 'Orders',
      url: '#',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      url: '#',
      icon: ShoppingBag,
    },

    {
      title: 'Contacts',
      url: '#',
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: 'Setting',
      url: '/setting',
      icon: Settings,
    },
  ],
};

const UserData = {
  name: 'PA',
  email: 'pavan@example.com',
  avatar: '/avatars/shadcn.jpg',
};
export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentPath = location.pathname;

  // const isSettingsPage = currentPath.startsWith('/setting');
  const currentNav = appsMenuItems;

  const isActive = (path: string) => currentPath.startsWith(path);
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="#">
                <div className="bg-[#D4E2FD] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Briefcase className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Multichoice</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu className="cursor-pointer ">
            {currentNav?.items?.map((item: any) => {
              return (
                <>
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
                </>
              );
            })}
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

'use client';

import * as React from 'react';
import { Briefcase, LayoutDashboard, Undo2 } from 'lucide-react';

import { NavSecondary } from '@/components/sideBar/nav-secondary';
import { NavUser } from '@/components/sideBar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { useUserRole } from '@/app/hooks';

const settingMenuItems = {
  items: [
    {
      title: 'Users Management',
      url: '/setting/users',
      icon: LayoutDashboard,
    },
    {
      title: 'Roles & Permissions',
      url: '/setting/permissions',
      icon: Briefcase,
    },
  ],
  navSecondary: [
    {
      title: 'back to app',
      url: 'apps/sales/accounts',
      icon: Undo2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { data }: any = useUserRole();
  const firstLetter = data.email?.slice(0, 2).toUpperCase();
  // const isSettingsPage = currentPath.startsWith('/setting');
  const currentNav = settingMenuItems;

  const UserData = {
    name: firstLetter,
    email: `${data.email}`,
    avatar: '/avatars/shadcn.jpg',
  };
  const isActive = (path: string) => currentPath.startsWith(path);
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
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
          hover:bg-[#D4E2FD] hover:text-[#274AFF] hover:border-l-4 hover:border-[#ccced6]
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

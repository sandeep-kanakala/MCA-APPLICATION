import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import {
  BadgeDollarSign,
  Briefcase,
  ChevronUp,
  CircleDollarSign,
  Handbag,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  Users,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const AppSideBar = () => {
  const [activeItem, setActiveItem] = useState(0);
  // Menu items.
  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Accounts",
      url: "/account",
      icon: Briefcase,
    },
    {
      title: "Quotes",
      url: "/",
      icon: BadgeDollarSign,
    },
    {
      title: "Orders",
      url: "#",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      url: "#",
      icon: ShoppingBag,
    },
    {
      title: "Leads",
      url: "/",
      icon: UsersRound,
    },
    {
      title: "Contacts",
      url: "#",
      icon: Users,
    },
    {
      title: "Opportunities",
      url: "#",
      icon: Handbag,
    },
    {
      title: "Price List",
      url: "#",
      icon: CircleDollarSign,
    },
  ];
  const footerItems = [
    {
      title: "Account",
      url: "#",
      icon: Handbag,
    },
    {
      title: "Billing",
      url: "#",
      icon: Handbag,
    },
    {
      title: "Sign out",
      url: "#",
      icon: LogOut,
    },
  ];
  return (
    <>
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="icon"
        className="transition-all duration-300"
      >
        <SidebarHeader className="border-b">
          <SidebarMenu className="">
            <SidebarMenuItem className="">
              <SidebarMenuButton
                asChild
                className="!bg-transparent hover:!bg-transparent hover:!text-inherit"
              >
                <div className="flex items-center gap-2  w-full  ">
                  <img
                    src="assets/sideBar/MenuOption.svg"
                    className="h-7 w-7"
                    alt="icon"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Multichoice Sales
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v1.0.10
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="cursor-pointer ">
                {menuItems.map((item, index: any) => {
                  const isActive = activeItem === index;

                  return (
                    <>
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          onClick={() => setActiveItem(index)}
                          className={`
          ${
            isActive
              ? "bg-[#D4E2FD] text-[#274AFF] border-l-4 border-[#274AFF]"
              : "text-gray-700"
          }
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
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="cursor-pointer h-[55px] border-t-2  pt-5 rounded-none bg-accent hover:bg-[#D4E2FD] ">
                    <div className="flex items-center justify-between h-16  cursor-pointer pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold">
                          VY
                        </div>

                        {/* Name + Email */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            John Doe
                          </span>
                          <span className="text-xs text-muted-foreground">
                            John@gmail.com
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="bg-white  min-w-[var(--radix-dropdown-menu-trigger-width)] shadow-md border rounded-md p-1 cursor-pointer "
                >
                  {footerItems?.map((footer) => {
                    return (
                      <>
                        <DropdownMenuItem
                          key={footer?.title}
                          className="hover:bg-[#D4E2FD] px-2  hover:border-transparent  hover:text-[#274AFF]  "
                        >
                          <Link
                            to={footer.url}
                            className="flex items-center gap-2  text-gray-700
                  transition-colors duration-200"
                          >
                            <footer.icon />
                            <span className="">{footer.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};
export default AppSideBar;

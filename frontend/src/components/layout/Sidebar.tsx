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
  ShoppingBag,
  ShoppingCart,
  Users,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const AppSideBar = () => {
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
      url: "/",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      url: "/",
      icon: ShoppingBag,
    },
    {
      title: "Leads",
      url: "/",
      icon: UsersRound,
    },
    {
      title: "Contacts",
      url: "/",
      icon: Users,
    },
    {
      title: "Opportunities",
      url: "/",
      icon: Handbag,
    },
    {
      title: "Price List",
      url: "/",
      icon: CircleDollarSign,
    },
  ];
  const footerItems = [
    {
      title: "Account",
      url: "#",
    },
    {
      title: "Billing",
      url: "#",
    },
    {
      title: "Sign out",
      url: "#",
      icon: "#",
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
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-2 py-2 w-full bg-accent ">
                  <img
                    src="assets/sideBar/MenuOption.svg"
                    className="h-7 w-7"
                    alt="icon"
                  />

                  <span className="font-semibold">Multichoice Sales</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="cursor-pointer ">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-[#D4E2FD] hover:text-[#274AFF]"
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
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="cursor-pointer bg-accent border-t hover:bg-[#D4E2FD] ">
                    <div className="flex items-center justify-between  py-4 cursor-pointer">
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
                  className="bg-white min-w-[var(--radix-dropdown-menu-trigger-width)] shadow-md border rounded-md p-2 cursor-pointer "
                >
                  {footerItems?.map((footer) => {
                    return (
                      <>
                        <DropdownMenuItem className="hover:bg-[#D4E2FD] px-2 hover:text-[#274AFF]">
                          <span>{footer?.title}</span>
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

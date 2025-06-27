"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface DrawerNavigationProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Icons.home,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
  },
  {
    name: "Animals",
    href: "/animals",
    icon: Icons.cow,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
    subItems: [
      {
        name: "All Animals",
        href: "/animals",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
      {
        name: "Add Animal",
        href: "/animals/add",
        roles: ["FARM_MANAGER"],
      },
      {
        name: "Health Records",
        href: "/animals/treatments",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
    ],
  },
  {
    name: "Production",
    href: "/production",
    icon: Icons.milk,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
    subItems: [
      {
        name: "Daily Records",
        href: "/production",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
      {
        name: "Add Production",
        href: "/production/add",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
      {
        name: "Serving Records",
        href: "/production/serving",
        roles: ["FARM_MANAGER"],
      },
    ],
  },
  {
    name: "Employees",
    href: "/employees",
    icon: Icons.users,
    roles: ["FARM_MANAGER"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: Icons.barChart,
    roles: ["FARM_MANAGER"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Icons.settings,
    roles: ["FARM_MANAGER"],
  },
];

export function DrawerNavigation({ children }: DrawerNavigationProps) {
  const { user, logout, isFarmManager } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const Sidebar = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Icons.cow className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Milk Farm</h2>
            <p className="text-xs text-gray-500">
              {isFarmManager ? "Manager Panel" : "Employee Panel"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const hasActiveSubItem =
              hasSubItems &&
              item.subItems?.some(
                (subItem) =>
                  pathname === subItem.href ||
                  pathname.startsWith(subItem.href + "/")
              );

            return (
              <li key={item.name}>
                {hasSubItems ? (
                  <>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                        hasActiveSubItem
                          ? "bg-green-100 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      onClick={() => toggleItemExpansion(item.name)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.name}</span>
                      <Icons.chevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "rotate-180" : ""
                        )}
                      />
                    </div>
                    {isExpanded && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.subItems
                          ?.filter((subItem) =>
                            subItem.roles.includes(user?.role || "")
                          )
                          .map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                                    isSubActive
                                      ? "bg-green-50 text-green-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-50"
                                  )}
                                  onClick={() => setIsDrawerOpen(false)}
                                >
                                  <div className="w-2 h-2 rounded-full bg-current opacity-40"></div>
                                  {subItem.name}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      isActive
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.username || "User"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Icons.user className="h-4 w-4 text-gray-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {isFarmManager ? "Farm Manager" : "Employee"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
        >
          <Icons.logOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-64 transform transition-transform duration-300 ease-in-out z-50",
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2"
              >
                <Icons.menu className="h-5 w-5" />
                Menu
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <Icons.cow className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Milk Farm</span>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

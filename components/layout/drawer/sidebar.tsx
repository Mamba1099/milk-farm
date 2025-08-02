"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation-items";
import { SidebarProps } from "@/lib/types";

// Helper function to validate image URLs
const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return url.startsWith('/') && url.length > 1;
  }
};

export function Sidebar({ 
  className, 
  expandedItems, 
  onToggleExpansion, 
  onCloseDrawer 
}: SidebarProps) {
  const { user, logout, isFarmManager } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const filteredNavItems = navigationItems.filter((item: { roles: string | string[]; }) =>
    item.roles.includes(user?.role || "")
  );

  return (
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
                      onClick={() => onToggleExpansion(item.name)}
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
                                  onClick={onCloseDrawer}
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
                    onClick={onCloseDrawer}
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
          {user?.image && isValidImageUrl(user.image) ? (
            <Image
              src={user.image}
              alt={user.username || "User"}
              width={32}
              height={32}
              className="rounded-full object-cover"
              onError={() => {
                console.warn("Failed to load user image:", user.image);
              }}
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
}

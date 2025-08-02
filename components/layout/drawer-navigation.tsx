"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, MobileHeader } from "./drawer";
import { DrawerNavigationProps } from "@/lib/types";

export function DrawerNavigation({ children }: DrawerNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 flex-shrink-0">
          <Sidebar
            expandedItems={expandedItems}
            onToggleExpansion={toggleItemExpansion}
            onCloseDrawer={closeDrawer}
          />
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeDrawer}
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
          <Sidebar
            expandedItems={expandedItems}
            onToggleExpansion={toggleItemExpansion}
            onCloseDrawer={closeDrawer}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && <MobileHeader onOpenDrawer={openDrawer} />}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

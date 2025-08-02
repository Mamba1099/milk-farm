"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { MobileHeaderProps } from "@/lib/types";

export function MobileHeader({ onOpenDrawer }: MobileHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenDrawer}
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
  );
}

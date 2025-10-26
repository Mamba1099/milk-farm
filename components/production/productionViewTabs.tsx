"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface ProductionViewTabsProps {
  viewTab: "production" | "calves";
  setViewTab: (tab: "production" | "calves") => void;
  calvesCount: number;
}

export function ProductionViewTabs({ viewTab, setViewTab, calvesCount }: ProductionViewTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
      <Button
        variant={viewTab === "production" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewTab("production")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
          ${viewTab === "production" 
            ? "bg-green-600 text-white shadow-sm" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }
        `}
      >
        <Icons.milk className="h-4 w-4" />
        Production
      </Button>
      
      <Button
        variant={viewTab === "calves" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewTab("calves")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
          ${viewTab === "calves" 
            ? "bg-orange-600 text-white shadow-sm" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }
        `}
      >
        <Icons.heart className="h-4 w-4" />
        Calves ({calvesCount})
      </Button>
    </div>
  );
}
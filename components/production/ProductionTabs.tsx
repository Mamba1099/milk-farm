import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductionTabsProps {
  tab: "morning" | "evening";
  setTab: (tab: "morning" | "evening") => void;
}

export function ProductionTabs({ tab, setTab }: ProductionTabsProps) {
  return (
    <Tabs defaultValue={tab} className="w-full sm:w-[220px] sticky top-0 z-30">
      <TabsList className="grid w-full grid-cols-2 bg-white rounded-lg shadow">
        <TabsTrigger value="morning" onClick={() => setTab("morning")} className="text-sm sm:text-base">
          Morning
        </TabsTrigger>
        <TabsTrigger value="evening" onClick={() => setTab("evening")} className="text-sm sm:text-base">
          Evening
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

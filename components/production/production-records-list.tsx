import React from "react";
import type { ProductionRecordsListProps } from "@/lib/types/production";
import { ProductionStatisticsCard } from "@/components/production/production-statistics-card";
import { ProductionRecordsTable } from "@/components/production/production-records-table";
import { ProductionViewTabs } from "@/components/production/productionViewTabs";

export const ProductionRecordsList: React.FC<ProductionRecordsListProps> = ({
  records,
  stats,
  userRole,
  showStats = true,
  showAddButton = true,
  title = "Production Records",
  className = "",
  viewTab = "production",
  setViewTab,
  calvesCount = 0,
}) => {
  return (
    <div className={`space-y-6 w-full ${className}`}>
      {showStats && <ProductionStatisticsCard stats={stats} />}
      
      {/* Production View Tabs - Only show if setViewTab is provided */}
      {setViewTab && (
        <div className="flex justify-center">
          <ProductionViewTabs 
            viewTab={viewTab} 
            setViewTab={setViewTab} 
            calvesCount={calvesCount} 
          />
        </div>
      )}
      
      <ProductionRecordsTable records={records} userRole={userRole} viewTab={viewTab} />
    </div>
  );
};

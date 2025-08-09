import React from "react";
import type { ProductionRecordsListProps } from "@/lib/types/production";
import { ProductionStatisticsCard } from "@/components/production/production-statistics-card";
import { ProductionRecordsTable } from "@/components/production/production-records-table";

export const ProductionRecordsList: React.FC<ProductionRecordsListProps> = ({
  records,
  stats,
  userRole,
  showStats = true,
  showAddButton = true,
  title = "Production Records",
  className = "",
}) => {
  return (
    <div className={`space-y-6 w-full ${className}`}>
      {showStats && <ProductionStatisticsCard stats={stats} />}
      <ProductionRecordsTable records={records} userRole={userRole} />
    </div>
  );
};

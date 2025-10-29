"use client";

import React from "react";
import { RingLoader } from "react-spinners";
import { useServings } from "@/hooks/use-serving-hooks";
import { formatDate } from "@/lib/date-utils";
import type { ServingRecord, ServingRecordsListProps } from "@/lib/types/serving";
import { ServingEditDialog } from "@/components/production/serving-edit-dialog";
import { ServingStatisticsCard } from "@/components/production/serving-statistics-card";
import { ServingRecordsTable } from "@/components/production/serving-records-table";

export function ServingRecordsList({ 
  filters, 
  showAddButton = true, 
  showStats = true, 
  title = "Serving Records",
  className = ""
}: ServingRecordsListProps): React.ReactElement {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedServing, setSelectedServing] = React.useState<ServingRecord | null>(null);

  const handleEditClick = (serving: ServingRecord) => {
    setSelectedServing(serving);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedServing(null);
  };
  
  const { data: servingResponse, error, isLoading, refetch } = useServings(filters);
  const servings = servingResponse?.servings || [];

  // Auto-refresh on visibility change (when tab becomes visible)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const stats = servings.reduce(
    (acc, serving) => {
      acc.total++;
      if (!serving.outcome || serving.outcome === "PENDING") acc.pending++;
      else if (serving.outcome === "SUCCESSFUL") acc.successful++;
      else if (serving.outcome === "FAILED") acc.failed++;
      if (serving.ovaType === "PREDETERMINED") acc.predetermined++;
      else acc.normalOva++;
      return acc;
    },
    {
      total: 0,
      pending: 0,
      successful: 0,
      failed: 0,
      predetermined: 0,
      normalOva: 0,
    }
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600">Error loading serving records. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading && servings.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex justify-center items-center py-12">
          <RingLoader color="#10b981" size={50} />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 w-full ${className}`}>
      {showStats && <ServingStatisticsCard stats={stats} />}
      <ServingRecordsTable
        servings={servings}
        showAddButton={showAddButton}
        title={title}
        onEdit={handleEditClick}
      />
      <ServingEditDialog serving={selectedServing} open={editDialogOpen} onClose={handleEditDialogClose} />
    </div>
  );
}

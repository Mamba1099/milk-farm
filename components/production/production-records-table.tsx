import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ProductionRecord, ProductionRecordsTableProps } from "@/lib/types/production";

export const ProductionRecordsTable: React.FC<ProductionRecordsTableProps> = ({ records, userRole, viewTab = "production" }) => {
  // Filter records based on viewTab
  const filteredRecords = React.useMemo(() => {
    if (viewTab === "production") {
      // Production tab: Show records from productive animals (mothers/cows) with milk production
      return records.filter(record => 
        record.animal.type !== "CALF" && 
        ((record.quantity_am && record.quantity_am > 0) || (record.quantity_pm && record.quantity_pm > 0))
      );
    } else {
      // Calves tab: Show records from calves only (who were fed)
      return records.filter(record => 
        record.animal.type === "CALF" &&
        ((record.calf_quantity_fed_am && record.calf_quantity_fed_am > 0) || 
         (record.calf_quantity_fed_pm && record.calf_quantity_fed_pm > 0))
      );
    }
  }, [records, viewTab]);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Animal</TableHead>
            {viewTab === "production" ? (
              <>
                <TableHead>Morning (L)</TableHead>
                <TableHead>Evening (L)</TableHead>
                <TableHead>Total (L)</TableHead>
                <TableHead>Calf Deduction</TableHead>
                <TableHead>Net Production</TableHead>
                <TableHead>Status</TableHead>
              </>
            ) : (
              <>
                <TableHead>Morning Fed (L)</TableHead>
                <TableHead>Evening Fed (L)</TableHead>
                <TableHead>Total Fed (L)</TableHead>
                <TableHead>Mother</TableHead>
              </>
            )}
            {userRole === "FARM_MANAGER" && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{formatDate(record.date)}</TableCell>
              <TableCell>
                {viewTab === "production" ? (
                  <div>
                    <div className="font-medium">{record.animal.tagNumber}</div>
                    {record.animal.name && (
                      <div className="text-sm text-gray-500">{record.animal.name}</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">{record.animal.tagNumber}</div>
                    {record.animal.name && (
                      <div className="text-sm text-gray-500">{record.animal.name}</div>
                    )}
                    <div className="text-xs text-blue-600">Calf</div>
                  </div>
                )}
              </TableCell>
              {viewTab === "production" ? (
                <>
                  <TableCell>{record.quantity_am ?? 0}L</TableCell>
                  <TableCell>{record.quantity_pm ?? 0}L</TableCell>
                  <TableCell className="font-medium">{(record.quantity_am ?? 0) + (record.quantity_pm ?? 0)}L</TableCell>
                  <TableCell>{(record.calf_quantity_fed_am ?? 0) + (record.calf_quantity_fed_pm ?? 0)}L</TableCell>
                  <TableCell className="font-medium text-green-600">{((record.quantity_am ?? 0) + (record.quantity_pm ?? 0)) - ((record.calf_quantity_fed_am ?? 0) + (record.calf_quantity_fed_pm ?? 0))}L</TableCell>
                  <TableCell>
                    <Badge variant={((record.balance_am ?? 0) + (record.balance_pm ?? 0)) > 0 ? "warning" : "success"}>
                      {((record.balance_am ?? 0) + (record.balance_pm ?? 0)) > 0 ? `${(record.balance_am ?? 0) + (record.balance_pm ?? 0)}L Carry` : "Recorded"}
                    </Badge>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{record.calf_quantity_fed_am ?? 0}L</TableCell>
                  <TableCell>{record.calf_quantity_fed_pm ?? 0}L</TableCell>
                  <TableCell className="font-medium">{(record.calf_quantity_fed_am ?? 0) + (record.calf_quantity_fed_pm ?? 0)}L</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {record.animal.motherName || "Unknown"}
                    </div>
                  </TableCell>
                </>
              )}
              {userRole === "FARM_MANAGER" && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Eye size={16} /></Button>
                    <Button size="sm" variant="outline"><Edit size={16} /></Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

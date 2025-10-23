import React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RobustImage } from "@/components/ui/robust-image";
import type { ProductionAnimal } from "@/lib/types/production";

interface CalfProductionTableProps {
  calves: ProductionAnimal[];
  tab: "morning" | "evening";
  formState: any;
  onCalfQuantityChange: (calfId: string, value: string) => void;
  onSubmit: (calfId: string) => void;
  disabled: (calfId: string) => boolean;
}

export const CalfProductionTable = React.memo(function CalfProductionTable({
  calves, 
  tab, 
  formState, 
  onCalfQuantityChange, 
  onSubmit, 
  disabled 
}: CalfProductionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Calf Feeding - {tab === "morning" ? "Morning" : "Evening"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Record milk quantities fed to each calf
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-3 py-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">Calf Info</TableHead>
              <TableHead className="px-3 py-3 text-center text-sm font-semibold text-gray-700 hidden lg:table-cell min-w-[120px]">Mother</TableHead>
              <TableHead className="px-3 py-3 text-center text-sm font-semibold text-gray-700 w-[100px]">Fed (L)</TableHead>
              <TableHead className="px-3 py-3 text-center text-sm font-semibold text-gray-700 w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No calves available for feeding records
                </TableCell>
              </TableRow>
            ) : (
              calves.map((calf, index) => {
                const record = formState[tab][calf.id] || {};
                const isDisabled = disabled(calf.id);
                
                return (
                  <TableRow 
                    key={calf.id} 
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors ${isDisabled ? "opacity-60" : ""}`}
                  >
                    <TableCell className="px-3 py-4">
                      <div className="flex items-center gap-4">
                        <RobustImage
                          src={calf.image_url}
                          alt={calf.name || `Calf ${calf.tagNumber || index + 1}`}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-gray-300 object-cover bg-white shadow-sm flex-shrink-0"
                          fallbackClassName="text-sm flex-shrink-0"
                          fallbackText={calf.name || `C${calf.tagNumber || index + 1}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {calf.name || `Calf ${calf.tagNumber || `#${index + 1}`}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Tag: {calf.tagNumber || "N/A"} • {calf.type}
                          </div>
                          {/* Show mother name on mobile/tablet */}
                          <div className="text-xs text-gray-400 lg:hidden mt-1">
                            Mother: {calf.motherName || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 py-4 text-center hidden lg:table-cell">
                      <div className="text-sm font-medium text-gray-700 truncate">
                        {calf.motherName || <span className="italic text-gray-400">Unknown</span>}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={record?.calfQuantity || ""}
                          onChange={(e) => onCalfQuantityChange(calf.id, e.target.value)}
                          className="w-16 text-center text-sm border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md"
                          placeholder="0.0"
                          disabled={isDisabled}
                        />
                        <span className="text-xs text-gray-500 font-medium ml-1">L</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 py-4 text-center">
                      <Button
                        onClick={() => onSubmit(calf.id)}
                        disabled={isDisabled || !record?.calfQuantity}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 text-xs rounded-md"
                        size="sm"
                      >
                        Submit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});
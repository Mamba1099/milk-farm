import React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RobustImage } from "@/components/ui/robust-image";
import type { ProductionAnimal } from "@/lib/types/production";

interface AnimalProductionTableProps {
  animals: ProductionAnimal[];
  tab: "morning" | "evening";
  formState: any;
  onQuantityChange: (animalId: string, value: string) => void;
  onSubmit: (animalId: string) => void;
  disabled: (animalId: string) => boolean;
}

export const AnimalProductionTable = React.memo(function AnimalProductionTable({ 
  animals, 
  tab, 
  formState, 
  onQuantityChange, 
  onSubmit, 
  disabled 
}: AnimalProductionTableProps) {
  const animalRecords = animals.filter(animal => animal.type !== "CALF");

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Animal Production - {tab === "morning" ? "Morning" : "Evening"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Record milk production quantities for each animal
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Animal</TableHead>
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">Production (L)</TableHead>
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animalRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                  No animals available for production recording
                </TableCell>
              </TableRow>
            ) : (
              animalRecords.map((animal, index) => {
                const record = formState[tab][animal.id] || {};
                const isDisabled = disabled(animal.id);
                
                return (
                  <TableRow 
                    key={animal.id} 
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors ${isDisabled ? "opacity-60" : ""}`}
                  >
                    <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <RobustImage
                          src={animal.image}
                          alt={animal.name || "Animal"}
                          width={40}
                          height={40}
                          className="sm:w-[60px] sm:h-[60px] rounded-full border-2 border-gray-300 object-cover bg-white shadow-sm flex-shrink-0"
                          fallbackClassName="text-sm sm:text-xl flex-shrink-0"
                          fallbackText={animal.name}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                            {animal.name || <span className="italic text-gray-400">Unnamed</span>}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">{animal.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={record?.quantity || ""}
                          onChange={(e) => onQuantityChange(animal.id, e.target.value)}
                          className="w-16 sm:w-24 text-center text-sm border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0.0"
                          disabled={isDisabled}
                        />
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">L</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <Button
                        onClick={() => onSubmit(animal.id)}
                        disabled={isDisabled || !record?.quantity}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-6 py-1 sm:py-2 text-xs sm:text-sm"
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
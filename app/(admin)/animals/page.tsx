"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useAnimals, useDeleteAnimal } from "@/hooks";
import { AnimalsEditDialog } from "@/components/animals/animal-edit-dialog";
import { AnimalDetailsDialog } from "@/components/animals/animal-details-dialog";
import { AnimalCard } from "@/components/animals/animal-card";
import { AnimalFilters } from "@/components/animals/animal-filters";
import {  AnimalFilters as AnimalFiltersType, AnimalWithDetails, AnimalWithParents } from "@/lib/types/animal";
import { DayEndTimer } from "@/components/production/day-end-timer";

// Animation variants
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AnimalsPage() {
  const { user, canEdit } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AnimalFiltersType>({
    searchTerm: "",
    selectedType: "",
    selectedGender: "",
    selectedHealth: "",
  });
  const [editingAnimal, setEditingAnimal] = useState<AnimalWithParents | null>(null);
  const [viewingAnimal, setViewingAnimal] = useState<AnimalWithDetails | null>(null);

  const {
    data: animalsData,
    isLoading,
    error,
  } = useAnimals({
    page,
    limit: 12,
    search: filters.searchTerm || undefined,
    type: (filters.selectedType as "COW" | "BULL" | "CALF") || undefined,
    gender: (filters.selectedGender as "MALE" | "FEMALE") || undefined,
    healthStatus: (filters.selectedHealth as "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINED") || undefined,
  });

  const deleteAnimalMutation = useDeleteAnimal();

  const handleDeleteAnimal = async (animalId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this animal? This action cannot be undone."
      )
    ) {
      await deleteAnimalMutation.mutateAsync(animalId);
    }
  };

  const handleViewAnimal = (animal: AnimalWithParents) => {
    setViewingAnimal({
      ...animal,
      isMatured: animal.isMatured ?? false,
      isReadyForProduction: animal.isReadyForProduction ?? false,
      notes: animal.notes,
      treatments: animal.treatments,
      productionRecords: animal.productionRecords,
      disposals: animal.disposals,
      servings: animal.servings,
      salesRecords: animal.salesRecords,
    });
  };

  const handleEditAnimal = (animal: AnimalWithParents) => {
    setEditingAnimal(animal);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading animals</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      {/* Day-end timer (runs in background for all users) */}
      <DayEndTimer 
        dayEndHour={24}          // Day ends at midnight (00:00)
        triggerMinutesBefore={60} // Trigger 1 hour before (23:00)
        isActive={true}          // Always active when animals page is open
      />
      
      <motion.div
        className="max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Animal Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your farm animals, track health, and monitor production
            </p>
          </div>
          {canEdit && (
            <Link href="/animals/add">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base">
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Add Animal
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Filters */}
        <AnimalFilters filters={filters} onFiltersChange={setFilters} />

        {/* Animals Grid */}
        {animalsData?.animals?.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {animalsData.animals.map((animalData: any) => {
                const animal: AnimalWithParents = {
                  id: animalData.id,
                  tagNumber: animalData.tagNumber,
                  name: animalData.name,
                  type: animalData.type,
                  gender: animalData.gender,
                  birthDate: animalData.birthDate,
                  expectedMaturityDate: animalData.expectedMaturityDate,
                  weight: animalData.weight,
                  healthStatus: animalData.healthStatus,
                  image: animalData.image,
                  mother: animalData.mother,
                  father: animalData.father,
                  isMatured: animalData.isMatured,
                  isReadyForProduction: animalData.isReadyForProduction,
                  notes: animalData.notes,
                  treatments: animalData.treatments,
                  productionRecords: animalData.productionRecords,
                  disposals: animalData.disposals,
                  servings: animalData.servings,
                  salesRecords: animalData.salesRecords,
                };

                return (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onView={handleViewAnimal}
                    onEdit={canEdit ? handleEditAnimal : undefined}
                    onDelete={canEdit ? handleDeleteAnimal : undefined}
                    canEdit={canEdit}
                  />
                );
              })}
            </motion.div>

            {/* Pagination */}
            {animalsData.pagination.pages > 1 && (
              <motion.div
                className="flex justify-center gap-2 flex-wrap"
                variants={fadeInUp}
              >
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="text-sm"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 sm:px-4 py-2 text-gray-700 text-sm">
                  Page {page} of {animalsData.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === animalsData.pagination.pages}
                  className="text-sm"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div className="text-center py-12" variants={fadeInUp}>
            <div className="text-gray-500 mb-4 text-sm sm:text-base">
              No animals found
            </div>
          </motion.div>
        )}

        {/* Edit Dialog */}
        {editingAnimal && (
          <AnimalsEditDialog
            animal={editingAnimal}
            isOpen={!!editingAnimal}
            onClose={() => setEditingAnimal(null)}
          />
        )}

        {/* Details Dialog */}
        {viewingAnimal && (
          <AnimalDetailsDialog
            animal={viewingAnimal}
            isOpen={!!viewingAnimal}
            onClose={() => setViewingAnimal(null)}
          />
        )}
      </motion.div>
    </div>
  );
}

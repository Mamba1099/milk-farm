"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useProductionReadyAnimals, useProductionRecords, useCreateProduction } from "@/hooks/use-production-hooks";
import { useAnimals } from "@/hooks/use-animal-hooks";
import type { ProductionAnimal, CreateProductionData } from "@/lib/types/production";
import { useRouter } from "next/navigation";
import { ProductionTabs } from "@/components/production/ProductionTabs";
import { AnimalProductionTable } from "@/components/production/animalProductionTable";
import { CalfProductionTable } from "@/components/production/calfProductionTable";
import { toast } from "@/components/ui/sonner";


const STORAGE_KEY = "milk-farm-production-form-state";

function getInitialState() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  }
  return { morning: {}, evening: {} };
}

export default function AddProductionPage() {
  const [tab, setTab] = useState<"morning" | "evening">("morning");
  const { data } = useProductionReadyAnimals();
  const animals: ProductionAnimal[] = data?.animals || [];
  
  const { data: allAnimalsData, isLoading: allAnimalsLoading } = useAnimals({ 
    limit: 1000, 
    type: "CALF" 
  });
  const calves: ProductionAnimal[] = allAnimalsData?.animals?.map((animal: { image: any; }) => ({
    ...animal,
    image_url: animal.image || "",
  })) || [];
  
  const [formState, setFormState] = useState(getInitialState());
  const today = useMemo(() => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().split('T')[0];
  }, []);
  const { data: prodData, isLoading: prodLoading } = useProductionRecords(1, 1000, { date: today });
  const router = useRouter();

  const createProductionMutation = useCreateProduction();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  const [submitting, setSubmitting] = useState<{ [animalId: string]: boolean }>({});
  
  const handleAnimalSubmit = useCallback(async (animalId: string) => {
    const animalData = formState[tab]?.[animalId];

    if (!animalData) {
      toast.error("Please enter production data before submitting.");
      return;
    }

    const isCalf = calves.some(c => c.id === animalId);
    const quantity = parseFloat(animalData.quantity || "0");
    const calfQuantity = parseFloat(animalData.calfQuantity || "0");

    if (isCalf) {
      if (calfQuantity <= 0) {
        toast.error("Please enter a valid feeding quantity for the calf.");
        return;
      }
    } else {
      if (quantity <= 0) {
        toast.error("Please enter a valid milk production quantity.");
        return;
      }
    }

    setSubmitting((prev) => ({ ...prev, [animalId]: true }));

    try {
      const productionData: CreateProductionData = {
        animalId,
        date: today,
        type: tab,
        ...(tab === "morning" ? {
          quantity_am: isCalf ? 0 : quantity,
          calf_quantity_fed_am: isCalf ? calfQuantity : 0,
        } : {
          quantity_pm: isCalf ? 0 : quantity,
          calf_quantity_fed_pm: isCalf ? calfQuantity : 0,
        }),
      };

      await createProductionMutation.mutateAsync(productionData);

      setFormState((prev: any) => {
        const updated = { ...prev[tab] };
        updated[animalId] = { ...updated[animalId], submitted: true };
        return { ...prev, [tab]: updated };
      });

      toast.success(`${isCalf ? "Calf feeding" : (tab === "morning" ? "Morning" : "Evening") + " production"} recorded successfully.`);

    } catch (error) {
      console.error("Failed to save production:", error);
      toast.error("Failed to save production data. Please try again.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [animalId]: false }));
    }
  }, [tab, formState, today, createProductionMutation, toast, calves]);

  const handleChange = useCallback((animalId: string, field: string, value: string) => {
    setFormState((prev: any) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [animalId]: {
          ...prev[tab][animalId],
          [field]: value,
        },
      },
    }));
  }, [tab]);

  const handleQuantityChange = useCallback((animalId: string, value: string) => {
    handleChange(animalId, "quantity", value);
  }, [handleChange]);

  const handleCalfQuantityChange = useCallback((calfId: string, value: string) => {
    handleChange(calfId, "calfQuantity", value);
  }, [handleChange]);



  const handleRemove = useCallback((animalId: string) => {
    setFormState((prev: any) => {
      const updated = { ...prev[tab] };
      delete updated[animalId];
      return { ...prev, [tab]: updated };
    });
  }, [tab]);

  const allRecords = prodData?.records || [];

  const animalIdsWithMorningRecord = new Set(
    allRecords
      .filter((rec) => rec.quantity_am !== null || rec.calf_quantity_fed_am !== null)
      .map((rec) => rec.animalId)
  );
  const animalIdsWithEveningRecord = new Set(
    allRecords
      .filter((rec) => rec.quantity_pm !== null || rec.calf_quantity_fed_pm !== null)
      .map((rec) => rec.animalId)
  );

  const isCardDisabled = (animalId: string) => {
    if (tab === "morning") {
      return animalIdsWithMorningRecord.has(animalId) || allHaveRecord;
    }
    return animalIdsWithEveningRecord.has(animalId) || allHaveRecord;
  };

  const allAnimalsHaveRecord = animals.length > 0 && (
    tab === "morning"
      ? animals.every((a) => animalIdsWithMorningRecord.has(a.id))
      : animals.every((a) => animalIdsWithEveningRecord.has(a.id))
  );
  const allCalvesHaveRecord = calves.length === 0 || (
    tab === "morning"
      ? calves.every((c) => animalIdsWithMorningRecord.has(c.id))
      : calves.every((c) => animalIdsWithEveningRecord.has(c.id))
  );
  const allHaveRecord = allAnimalsHaveRecord && allCalvesHaveRecord;

  const now = useMemo(() => Date.now(), []);
  const nextUnlock = useMemo(() => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }, []);
  const msLeft = nextUnlock - now;
  const hours = Math.floor(msLeft / 1000 / 60 / 60);
  const mins = Math.floor((msLeft / 1000 / 60) % 60);
  const secs = Math.floor((msLeft / 1000) % 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center pt-4 sm:pt-8">
      {/* Dashboard summary and tabs */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8 px-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Milk Production Entry</h1>
          <p className="text-gray-600 text-sm sm:text-base">Record the morning and evening milk production for each animal and calf milk feeding.</p>
        </div>
        <ProductionTabs tab={tab} setTab={setTab} />
      </div>
      {allHaveRecord ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <div className="text-lg sm:text-xl font-semibold text-green-700 mb-2 text-center">All {tab === "morning" ? "morning" : "evening"} records for today have been submitted.</div>
          <div className="text-gray-600 mb-4 text-center text-sm sm:text-base">Wait until the next day to add {tab === "morning" ? "morning" : "evening"} data.</div>
          <div className="text-base sm:text-lg font-mono text-purple-700 text-center">Next entry available in {hours.toString().padStart(2, "0")}:{mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}</div>
        </div>
      ) : (
        <div className="w-full mx-auto px-2 sm:px-4">
          {/* Desktop Layout - Side by Side Tables (Hidden on mobile and tablet) */}
          <div className="hidden xl:grid xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
            <AnimalProductionTable
              animals={animals}
              tab={tab}
              formState={formState}
              onQuantityChange={handleQuantityChange}
              onSubmit={handleAnimalSubmit}
              disabled={isCardDisabled}
              submitting={submitting}
            />
            <CalfProductionTable
              calves={calves}
              tab={tab}
              formState={formState}
              onCalfQuantityChange={handleCalfQuantityChange}
              onSubmit={handleAnimalSubmit}
              disabled={isCardDisabled}
              submitting={submitting}
            />
          </div>

          {/* Mobile/Tablet Layout - Stacked Tables (Hidden on desktop) */}
          <div className="xl:hidden space-y-4 sm:space-y-6">
            <AnimalProductionTable
                animals={animals}
                tab={tab}
                formState={formState}
                onQuantityChange={handleQuantityChange}
                onSubmit={handleAnimalSubmit}
                disabled={isCardDisabled}/>
            <CalfProductionTable
              calves={calves}
              tab={tab}
              formState={formState}
              onCalfQuantityChange={handleCalfQuantityChange}
              onSubmit={handleAnimalSubmit}
              disabled={isCardDisabled}
              submitting={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

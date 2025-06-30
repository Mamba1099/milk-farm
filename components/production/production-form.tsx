"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import {
  useProductionReadyAnimals,
  useCreateProduction,
  type CreateProductionData,
  type ProductionAnimal,
} from "@/hooks/use-production-hooks";
import Image from "next/image";

interface ProductionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedDate?: string;
}

export function ProductionForm({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
}: ProductionFormProps) {
  const { toast } = useToast();
  const [selectedAnimal, setSelectedAnimal] = useState<ProductionAnimal | null>(
    null
  );
  const [formData, setFormData] = useState({
    morningQuantity: "",
    eveningQuantity: "",
    calfQuantity: "",
    poshoQuantity: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: animalsData, isLoading: animalsLoading } =
    useProductionReadyAnimals();
  const createProductionMutation = useCreateProduction();

  const animals = animalsData?.animals || [];

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedAnimal) {
      newErrors.animal = "Please select an animal";
    }

    if (!formData.morningQuantity && !formData.eveningQuantity) {
      newErrors.quantities =
        "At least one production quantity (morning or evening) is required";
    }

    if (formData.morningQuantity && parseFloat(formData.morningQuantity) < 0) {
      newErrors.morningQuantity = "Morning quantity must be non-negative";
    }

    if (formData.eveningQuantity && parseFloat(formData.eveningQuantity) < 0) {
      newErrors.eveningQuantity = "Evening quantity must be non-negative";
    }

    if (formData.calfQuantity && parseFloat(formData.calfQuantity) < 0) {
      newErrors.calfQuantity = "Calf quantity must be non-negative";
    }

    if (formData.poshoQuantity && parseFloat(formData.poshoQuantity) < 0) {
      newErrors.poshoQuantity = "Posho quantity must be non-negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedAnimal) return;

    const productionData: CreateProductionData = {
      animalId: selectedAnimal.id,
      date: selectedDate || new Date().toISOString(),
      morningQuantity: parseFloat(formData.morningQuantity) || 0,
      eveningQuantity: parseFloat(formData.eveningQuantity) || 0,
      calfQuantity: formData.calfQuantity
        ? parseFloat(formData.calfQuantity)
        : undefined,
      poshoQuantity: formData.poshoQuantity
        ? parseFloat(formData.poshoQuantity)
        : undefined,
      notes: formData.notes || undefined,
    };

    try {
      await createProductionMutation.mutateAsync(productionData);
      toast({
        type: "success",
        title: "Success",
        description: "Production record created successfully",
      });
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create production record";
      toast({
        type: "error",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const resetForm = () => {
    setSelectedAnimal(null);
    setFormData({
      morningQuantity: "",
      eveningQuantity: "",
      calfQuantity: "",
      poshoQuantity: "",
      notes: "",
    });
    setErrors({});
  };

  const totalProduction =
    (parseFloat(formData.morningQuantity) || 0) +
    (parseFloat(formData.eveningQuantity) || 0);
  const totalDeductions =
    (parseFloat(formData.calfQuantity) || 0) +
    (parseFloat(formData.poshoQuantity) || 0);
  const availableForSales = Math.max(0, totalProduction - totalDeductions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Production Record</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
          {selectedDate && (
            <p className="text-sm text-gray-600">
              Date: {new Date(selectedDate).toLocaleDateString()}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Animal Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Animal
              </label>
              {animalsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Icons.spinner className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {animals.map((animal) => (
                    <div
                      key={animal.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnimal?.id === animal.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAnimal(animal)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          {animal.image ? (
                            <Image
                              src={animal.image}
                              alt={`${animal.name || animal.tagNumber}'s image`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <Icons.heart className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {animal.name || `Animal ${animal.tagNumber}`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Tag: {animal.tagNumber}
                          </p>
                          {animal.motherOf.length > 0 && (
                            <p className="text-xs text-blue-600">
                              Has {animal.motherOf.length} calf(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.animal && (
                <p className="text-sm text-red-600 mt-1">{errors.animal}</p>
              )}
            </div>

            {/* Production Quantities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Morning Quantity (Liters)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.morningQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      morningQuantity: e.target.value,
                    })
                  }
                  className={errors.morningQuantity ? "border-red-500" : ""}
                />
                {errors.morningQuantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.morningQuantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evening Quantity (Liters)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.eveningQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eveningQuantity: e.target.value,
                    })
                  }
                  className={errors.eveningQuantity ? "border-red-500" : ""}
                />
                {errors.eveningQuantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.eveningQuantity}
                  </p>
                )}
              </div>
            </div>

            {errors.quantities && (
              <p className="text-sm text-red-600">{errors.quantities}</p>
            )}

            {/* Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calf Quantity (Liters)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.calfQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, calfQuantity: e.target.value })
                  }
                  className={errors.calfQuantity ? "border-red-500" : ""}
                />
                {errors.calfQuantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.calfQuantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posho Quantity (Liters)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.poshoQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, poshoQuantity: e.target.value })
                  }
                  className={errors.poshoQuantity ? "border-red-500" : ""}
                />
                {errors.poshoQuantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.poshoQuantity}
                  </p>
                )}
              </div>
            </div>

            {/* Production Summary */}
            {totalProduction > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Production Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Production:</span>
                    <span className="font-medium ml-2">
                      {totalProduction.toFixed(1)}L
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Deductions:</span>
                    <span className="font-medium ml-2">
                      {totalDeductions.toFixed(1)}L
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Available for Sales:</span>
                    <span className="font-medium ml-2 text-green-600">
                      {availableForSales.toFixed(1)}L
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add any additional notes about this production record..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createProductionMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createProductionMutation.isPending ? (
                  <>
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Production Record"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

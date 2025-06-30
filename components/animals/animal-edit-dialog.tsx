"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateAnimal, useAvailableParents } from "@/hooks";
import { useToast } from "@/hooks";
import Image from "next/image";

interface Animal {
  id: string;
  tagNumber: string;
  name?: string | null;
  type: "COW" | "BULL" | "CALF";
  gender: "MALE" | "FEMALE";
  birthDate: string;
  expectedMaturityDate?: string | null;
  weight?: number | null;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINED";
  image?: string | null;
  motherId?: string | null;
  fatherId?: string | null;
  mother?: { id: string; tagNumber: string; name?: string | null } | null;
  father?: { id: string; tagNumber: string; name?: string | null } | null;
}

interface AnimalEditDialogProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
}

export function AnimalsEditDialog({
  animal,
  isOpen,
  onClose,
}: AnimalEditDialogProps) {
  const { toast } = useToast();
  const updateAnimalMutation = useUpdateAnimal();
  const { data: availableMothers } = useAvailableParents("FEMALE");
  const { data: availableFathers } = useAvailableParents("MALE");

  const [formData, setFormData] = useState({
    tagNumber: animal.tagNumber,
    name: animal.name || "",
    type: animal.type,
    gender: animal.gender,
    birthDate: new Date(animal.birthDate).toISOString().split("T")[0],
    expectedMaturityDate: animal.expectedMaturityDate
      ? (() => {
          try {
            return new Date(animal.expectedMaturityDate)
              .toISOString()
              .split("T")[0];
          } catch (error) {
            console.error(
              "Error parsing expectedMaturityDate:",
              animal.expectedMaturityDate,
              error
            );
            return "";
          }
        })()
      : "",
    weight: animal.weight?.toString() || "",
    healthStatus: animal.healthStatus,
    motherId: animal.motherId || "",
    fatherId: animal.fatherId || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (animal) {
      setFormData({
        tagNumber: animal.tagNumber,
        name: animal.name || "",
        type: animal.type,
        gender: animal.gender,
        birthDate: new Date(animal.birthDate).toISOString().split("T")[0],
        expectedMaturityDate: animal.expectedMaturityDate
          ? (() => {
              try {
                return new Date(animal.expectedMaturityDate)
                  .toISOString()
                  .split("T")[0];
              } catch (error) {
                console.error(
                  "Error parsing expectedMaturityDate:",
                  animal.expectedMaturityDate,
                  error
                );
                return "";
              }
            })()
          : "",
        weight: animal.weight?.toString() || "",
        healthStatus: animal.healthStatus,
        motherId: animal.motherId || "",
        fatherId: animal.fatherId || "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [animal]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          type: "error",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          type: "error",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData = {
        id: animal.id,
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        birthDate: new Date(formData.birthDate),
        expectedMaturityDate: formData.expectedMaturityDate
          ? new Date(formData.expectedMaturityDate)
          : undefined,
        image: imageFile,
        motherId: formData.motherId || undefined,
        fatherId: formData.fatherId || undefined,
      };

      await updateAnimalMutation.mutateAsync(updateData);

      toast({
        title: "Success",
        description: "Animal updated successfully",
        type: "success",
      });

      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update animal";
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              Edit Animal: {animal.name || animal.tagNumber}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : animal.image ? (
                      <Image
                        src={animal.image}
                        alt="Current"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag Number *
                  </label>
                  <Input
                    value={formData.tagNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, tagNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "COW" | "BULL" | "CALF",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="COW">Cow</option>
                    <option value="BULL">Bull</option>
                    <option value="CALF">Calf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as "MALE" | "FEMALE",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Maturity Date
                  </label>
                  <Input
                    type="date"
                    value={formData.expectedMaturityDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedMaturityDate: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When this animal is expected to mature and be ready for
                    production
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>
                <div></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Status *
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      healthStatus: e.target.value as
                        | "HEALTHY"
                        | "SICK"
                        | "RECOVERING"
                        | "QUARANTINED",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="HEALTHY">Healthy</option>
                  <option value="SICK">Sick</option>
                  <option value="RECOVERING">Recovering</option>
                  <option value="QUARANTINED">Quarantined</option>
                </select>
              </div>

              {/* Parent Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother
                  </label>
                  <select
                    value={formData.motherId}
                    onChange={(e) =>
                      setFormData({ ...formData, motherId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Mother</option>
                    {availableMothers?.map(
                      (mother: {
                        id: string;
                        tagNumber: string;
                        name?: string | null;
                      }) => (
                        <option key={mother.id} value={mother.id}>
                          {mother.name || `Animal ${mother.tagNumber}`} (
                          {mother.tagNumber})
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father
                  </label>
                  <select
                    value={formData.fatherId}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Father</option>
                    {availableFathers?.map(
                      (father: {
                        id: string;
                        tagNumber: string;
                        name?: string | null;
                      }) => (
                        <option key={father.id} value={father.id}>
                          {father.name || `Animal ${father.tagNumber}`} (
                          {father.tagNumber})
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updateAnimalMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateAnimalMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateAnimalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Animal"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

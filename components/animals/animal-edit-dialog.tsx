"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RingLoader } from "react-spinners";
import { useUpdateAnimal, useAnimal } from "@/hooks";
import { useToast } from "@/hooks";
import { UpdateAnimalSchema, UpdateAnimalInput } from "@/lib/validators/animal";
import { Animal, AnimalEditDialogProps, AnimalEditFormInput } from "@/lib/types/animal";

export function AnimalsEditDialog({
  animal,
  isOpen,
  onClose,
}: AnimalEditDialogProps) {
  const { toast } = useToast();
  const updateAnimalMutation = useUpdateAnimal();
  const { data: freshAnimalData, isLoading: isFetchingAnimal } = useAnimal(animal.id);
  const currentAnimal = freshAnimalData || animal;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AnimalEditFormInput>({
    defaultValues: {
      tagNumber: "",
      name: "",
      type: "COW",
      gender: "FEMALE",
      birthDate: "",
      expectedMaturityDate: "",
      weight: "",
      healthStatus: "HEALTHY",
      motherName: "",
      fatherName: "",
    },
  });

  useEffect(() => {
    if (currentAnimal && isOpen) {
      reset({
        tagNumber: currentAnimal.tagNumber,
        name: currentAnimal.name || "",
        type: currentAnimal.type,
        gender: currentAnimal.gender,
        birthDate: new Date(currentAnimal.birthDate).toISOString().split("T")[0],
        expectedMaturityDate: currentAnimal.expectedMaturityDate
          ? (() => {
              try {
                return new Date(currentAnimal.expectedMaturityDate)
                  .toISOString()
                  .split("T")[0];
              } catch (error) {
                console.error("Error parsing expectedMaturityDate:", error);
                return "";
              }
            })()
          : "",
        weight: currentAnimal.weight?.toString() || "",
        healthStatus: currentAnimal.healthStatus,
        motherName: currentAnimal.motherName || "",
        fatherName: currentAnimal.fatherName || "",
      });
      setImageFile(null);
      setImagePreview("");
    }
  }, [currentAnimal, isOpen, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          type: "error",
          title: "Error",
          description: "Image must be less than 5MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          type: "error",
          title: "Error",
          description: "Please select a valid image file",
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

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const onSubmit = async (data: AnimalEditFormInput) => {
    try {
      const validatedData = UpdateAnimalSchema.parse({
        id: currentAnimal.id,
        ...data,
        birthDate: data.birthDate,
        expectedMaturityDate: data.expectedMaturityDate || undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        motherName: data.motherName || undefined,
        fatherName: data.fatherName || undefined,
      });

      const submitData: UpdateAnimalInput = {
        ...validatedData,
        image: imageFile,
      };

      await updateAnimalMutation.mutateAsync(submitData);
      onClose();
    } catch (error: any) {
      console.error("Animal update error:", error);
      
      if (error.errors) {
        const firstError = error.errors[0];
        toast({
          type: "error",
          title: "Validation Error",
          description: firstError.message,
        });
      } else if (error.message) {
        toast({
          type: "error",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Error", 
          description: "Failed to update animal. Please check your input and try again.",
        });
      }
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Image
                </label>
                <div className="space-y-4">
                  {(imagePreview || currentAnimal?.image) && (
                    <motion.div 
                      className="relative w-full max-w-xs mx-auto sm:mx-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={imagePreview || currentAnimal?.image!}
                        alt="Animal preview"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover w-full h-48"
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </motion.div>
                  )}
                  <label className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm sm:text-base transition-colors">
                    <Upload size={18} className="mr-2" />
                    {imagePreview || currentAnimal?.image ? "Change Photo" : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag Number *
                  </label>
                  <Input
                    {...register("tagNumber", { required: "Tag number is required" })}
                    placeholder="Enter tag number"
                    className={errors.tagNumber ? "border-red-500" : ""}
                  />
                  {errors.tagNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.tagNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="Enter animal name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    {...register("type", { required: "Type is required" })}
                    className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.type ? "border-red-500" : ""
                    }`}
                  >
                    <option value="COW">Cow</option>
                    <option value="BULL">Bull</option>
                    <option value="CALF">Calf</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    {...register("gender", { required: "Gender is required" })}
                    className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.gender ? "border-red-500" : ""
                    }`}
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date *
                  </label>
                  <Input
                    type="date"
                    {...register("birthDate", { required: "Birth date is required" })}
                    className={errors.birthDate ? "border-red-500" : ""}
                  />
                  {errors.birthDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Maturity Date
                  </label>
                  <Input
                    type="date"
                    {...register("expectedMaturityDate")}
                    className={errors.expectedMaturityDate ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When this animal is expected to mature and be ready for production
                  </p>
                  {errors.expectedMaturityDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.expectedMaturityDate.message}</p>
                  )}
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
                    {...register("weight", {
                      validate: (value) => {
                        if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
                          return "Weight must be a positive number";
                        }
                        return true;
                      }
                    })}
                    placeholder="Enter weight"
                    className={errors.weight ? "border-red-500" : ""}
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Health Status *
                  </label>
                  <select
                    {...register("healthStatus", { required: "Health status is required" })}
                    className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.healthStatus ? "border-red-500" : ""
                    }`}
                  >
                    <option value="HEALTHY">Healthy</option>
                    <option value="SICK">Sick</option>
                    <option value="RECOVERING">Recovering</option>
                    <option value="QUARANTINED">Quarantined</option>
                  </select>
                  {errors.healthStatus && (
                    <p className="text-red-500 text-xs mt-1">{errors.healthStatus.message}</p>
                  )}
                </div>
              </div>

              {/* Parent Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother (Name or Tag Number)
                  </label>
                  <Input
                    {...register("motherName")}
                    placeholder="Enter mother's name or tag number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the mother's name or tag number if known
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father (Name or Tag Number)
                  </label>
                  <Input
                    {...register("fatherName")}
                    placeholder="Enter father's name or tag number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the father's name or tag number if known
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || updateAnimalMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || updateAnimalMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting || updateAnimalMutation.isPending ? (
                    <>
                      <RingLoader
                        size={20}
                        color="#ffffff"
                        speedMultiplier={0.8}
                        className="mr-2"
                      />
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

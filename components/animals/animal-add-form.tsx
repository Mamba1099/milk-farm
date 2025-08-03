"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RingLoader } from "react-spinners";
import { useCreateAnimal } from "@/hooks/use-animal-hooks";
import { useToast } from "@/hooks/use-toast";
import { CreateAnimalSchema, CreateAnimalInput } from "@/lib/validators/animal";
import { AnimalAddFormProps } from "@/lib/types/animal";

type AnimalFormInput = Omit<CreateAnimalInput, 'birthDate' | 'expectedMaturityDate' | 'image' | 'weight'> & {
  birthDate: string;
  expectedMaturityDate?: string;
  weight?: string;
};

export function AnimalAddForm({ onSuccess, onCancel }: AnimalAddFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const createAnimalMutation = useCreateAnimal();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnimalFormInput>({
    defaultValues: {
      tagNumber: "",
      name: "",
      type: "COW",
      gender: "FEMALE",
      birthDate: new Date().toISOString().split("T")[0],
      expectedMaturityDate: "",
      motherName: "",
      fatherName: "",
      healthStatus: "HEALTHY",
      notes: "",
    },
  });

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

  const onSubmit = async (data: AnimalFormInput) => {
    try {
      const validatedData = CreateAnimalSchema.parse({
        ...data,
        birthDate: data.birthDate,
        expectedMaturityDate: data.expectedMaturityDate || undefined,
        weight: data.weight ? parseFloat(data.weight as string) : undefined,
      });

      const submitData: CreateAnimalInput = {
        ...validatedData,
        image: imageFile,
      };

      await createAnimalMutation.mutateAsync(submitData);

      reset();
      setImageFile(null);
      setImagePreview("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Animal creation error:", error);
      
      if (error.errors) {
        // Zod validation errors
        const firstError = error.errors[0];
        toast({
          type: "error",
          title: "Validation Error",
          description: firstError.message,
        });
      } else if (error.message) {
        // API or mutation errors
        toast({
          type: "error",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Error", 
          description: "Failed to add animal. Please check your input and try again.",
        });
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <Card className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={fadeInUp}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Number *
                </label>
                <Input
                  {...register("tagNumber")}
                  placeholder="Enter tag number"
                  className={errors.tagNumber ? "border-red-500" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <Input {...register("name")} placeholder="Enter animal name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  {...register("type")}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.type ? "border-red-500" : ""
                  }`}
                >
                  <option value="COW">Cow</option>
                  <option value="BULL">Bull</option>
                  <option value="CALF">Calf</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  {...register("gender")}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date *
                </label>
                <Input
                  type="date"
                  {...register("birthDate")}
                  className={errors.birthDate ? "border-red-500" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Maturity Date
                </label>
                <Input
                  type="date"
                  {...register("expectedMaturityDate")}
                  className={errors.expectedMaturityDate ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  When this animal is expected to mature and be ready for
                  production
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  {...register("weight", {
                    validate: (value) => {
                      if (value && value.trim() !== "") {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue) || numValue < 0) {
                          return "Weight must be a positive number";
                        }
                      }
                      return true;
                    }
                  })}
                  placeholder="Enter weight in kg"
                  className={errors.weight ? "border-red-500" : ""}
                />
                {errors.weight && (
                  <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
                )}
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Status
                </label>
                <select
                  {...register("healthStatus")}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.healthStatus ? "border-red-500" : ""
                  }`}
                >
                  <option value="HEALTHY">Healthy</option>
                  <option value="SICK">Sick</option>
                  <option value="RECOVERING">Recovering</option>
                  <option value="QUARANTINED">Quarantined</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Parent Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother Name (Optional)
                </label>
                <Input
                  {...register("motherName")}
                  placeholder="e.g., Bessie, Daisy, or Tag Number"
                  className={errors.motherName ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the mother&apos;s name or tag number
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name (Optional)
                </label>
                <Input
                  {...register("fatherName")}
                  placeholder="e.g., Thunder, Hercules, or Tag Number"
                  className={errors.fatherName ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the father&apos;s name or tag number
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Animal Photo
            </h2>
            <div className="space-y-4">
              {imagePreview && (
                <motion.div 
                  className="relative w-full max-w-xs mx-auto sm:mx-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={imagePreview}
                    alt="Animal preview"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover w-full h-48"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm sm:text-base transition-colors">
                  <Upload size={18} className="mr-2" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <Camera size={18} />
                  Take Photo
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Add any additional notes about this animal..."
              className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                errors.notes ? "border-red-500" : ""
              }`}
            />
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 pt-6"
            variants={fadeInUp}
          >
            <Button
              type="submit"
              disabled={isSubmitting || createAnimalMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-sm sm:text-base"
            >
              {isSubmitting || createAnimalMutation.isPending ? (
                <>
                  <RingLoader
                    size={20}
                    color="#ffffff"
                    speedMultiplier={0.8}
                    className="mr-2"
                  />
                  Adding Animal...
                </>
              ) : (
                "Add Animal"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || createAnimalMutation.isPending}
              className="flex-1 sm:flex-none text-sm sm:text-base"
            >
              Cancel
            </Button>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
}

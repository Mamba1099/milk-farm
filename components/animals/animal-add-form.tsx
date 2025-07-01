"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCreateAnimal } from "@/hooks";
import { CreateAnimalSchema, CreateAnimalInput } from "@/lib/validators/animal";

interface AnimalAddFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnimalAddForm({ onSuccess, onCancel }: AnimalAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const createAnimalMutation = useCreateAnimal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAnimalInput>({
    resolver: zodResolver(CreateAnimalSchema),
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
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
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

  const onSubmit = async (data: CreateAnimalInput) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Prepare submit data with proper date conversion
      const submitData = {
        ...data,
        birthDate: new Date(data.birthDate as string),
        expectedMaturityDate: data.expectedMaturityDate
          ? new Date(data.expectedMaturityDate as string)
          : undefined,
        image: imageFile,
      };

      await createAnimalMutation.mutateAsync(submitData);

      toast({
        title: "Success",
        description: "Animal added successfully",
      });

      reset();
      setImageFile(null);
      setImagePreview("");
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error creating animal:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add animal";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div>
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
              {errors.tagNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.tagNumber.message}
                </p>
              )}
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
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              {errors.birthDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.birthDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Maturity Date
              </label>
              <Input type="date" {...register("expectedMaturityDate")} />
              <p className="text-xs text-gray-500 mt-1">
                When this animal is expected to mature and be ready for
                production
              </p>
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Status
              </label>
              <select
                {...register("healthStatus")}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="HEALTHY">Healthy</option>
                <option value="SICK">Sick</option>
                <option value="RECOVERING">Recovering</option>
                <option value="QUARANTINED">Quarantined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div>
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
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the father&apos;s name or tag number
              </p>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Animal Photo
          </h2>
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative w-full max-w-xs mx-auto sm:mx-0">
                <Image
                  src={imagePreview}
                  alt="Animal preview"
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full h-48"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm sm:text-base">
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
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            rows={4}
            placeholder="Add any additional notes about this animal..."
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
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
            className="flex-1 sm:flex-none text-sm sm:text-base"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

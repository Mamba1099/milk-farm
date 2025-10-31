"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X, Syringe, Calendar, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RingLoader } from "react-spinners";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTreatment } from "@/hooks/use-animal-hooks";
import { useAnimals } from "@/hooks/use-animal-hooks";
import {
  CreateTreatmentSchema,
  CreateTreatmentInput,
} from "@/lib/validators/animal";
import { TreatmentFormData } from "@/lib/types/animal";
import { toast } from "@/components/ui/sonner";

interface TreatmentFormProps {
  animalId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TreatmentForm({
  animalId,
  isOpen,
  onClose,
  onSuccess,
}: TreatmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTreatmentMutation = useCreateTreatment();
  // toast from sonner

  const { data: animalsData } = useAnimals({
    page: 1,
    limit: 1000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TreatmentFormData>({
    defaultValues: {
      animalId: animalId || "",
      disease: "",
      medicine: "",
      dosage: "",
      treatment: "",
      cost: 0,
      treatedAt: (() => {
        const now = new Date();
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split("T")[0];
      })(),
      treatedBy: "",
      notes: "",
    },
  });

  const onSubmit = async (data: TreatmentFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const treatmentData: CreateTreatmentInput = {
        ...data,
        treatedAt: new Date(data.treatedAt),
      };
      
      const validatedData = CreateTreatmentSchema.parse(treatmentData);
      
      await createTreatmentMutation.mutateAsync(validatedData);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Treatment creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormError = (errors: any) => {
    const errorMessages = Object.values(errors).map((error: any) => error?.message).filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0] || "Please check your input and try again");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-600" />
            Add Treatment Record
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, handleFormError)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Animal Selection */}
            <div className="space-y-2">
              <label
                htmlFor="animalId"
                className="text-sm font-medium text-gray-700"
              >
                Select Animal *
              </label>
              <select
                id="animalId"
                {...register("animalId", { required: "Please select an animal" })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.animalId ? "border-red-500" : ""
                }`}
              >
                <option value="">Select an animal</option>
                {animalsData?.animals?.map(
                  (animal: {
                    id: string;
                    name?: string;
                    tagNumber: string;
                  }) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name || `Animal ${animal.tagNumber}`} -{" "}
                      {animal.tagNumber}
                    </option>
                  )
                )}
              </select>
              {errors.animalId && (
                <p className="text-sm text-red-600">
                  {errors.animalId.message}
                </p>
              )}
            </div>

            {/* Disease */}
            <div className="space-y-2">
              <label
                htmlFor="disease"
                className="text-sm font-medium text-gray-700"
              >
                Disease *
              </label>
              <Input
                id="disease"
                placeholder="Enter disease or condition"
                {...register("disease", { required: "Disease is required" })}
                className={errors.disease ? "border-red-500" : ""}
              />
              {errors.disease && (
                <p className="text-sm text-red-600">{errors.disease.message}</p>
              )}
            </div>

            {/* Medicine */}
            <div className="space-y-2">
              <label
                htmlFor="medicine"
                className="text-sm font-medium text-gray-700"
              >
                Medicine
              </label>
              <Input
                id="medicine"
                placeholder="Enter medicine name"
                {...register("medicine")}
                className={errors.medicine ? "border-red-500" : ""}
              />
              {errors.medicine && (
                <p className="text-sm text-red-600">
                  {errors.medicine.message}
                </p>
              )}
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <label
                htmlFor="dosage"
                className="text-sm font-medium text-gray-700"
              >
                Dosage
              </label>
              <Input
                id="dosage"
                placeholder="Enter dosage details"
                {...register("dosage")}
                className={errors.dosage ? "border-red-500" : ""}
              />
              {errors.dosage && (
                <p className="text-sm text-red-600">{errors.dosage.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Either medicine or dosage must be provided
              </p>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label
                htmlFor="treatedAt"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Treatment Date
              </label>
              <Input
                id="treatedAt"
                type="date"
                {...register("treatedAt", { required: "Treatment date is required" })}
                className={errors.treatedAt ? "border-red-500" : ""}
              />
              {errors.treatedAt && (
                <p className="text-sm text-red-600">
                  {errors.treatedAt.message}
                </p>
              )}
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <label
                htmlFor="cost"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <DollarSign className="h-4 w-4" />
                Cost (KES)
              </label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("cost", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Cost must be positive" }
                })}
                className={errors.cost ? "border-red-500" : ""}
              />
              {errors.cost && (
                <p className="text-sm text-red-600">{errors.cost.message}</p>
              )}
            </div>

            {/* Treated By */}
            <div className="space-y-2">
              <label
                htmlFor="treatedBy"
                className="text-sm font-medium text-gray-700"
              >
                Treated By (Veterinarian)
              </label>
              <Input
                id="treatedBy"
                placeholder="Enter veterinarian name"
                {...register("treatedBy")}
                className={errors.treatedBy ? "border-red-500" : ""}
              />
              {errors.treatedBy && (
                <p className="text-sm text-red-600">{errors.treatedBy.message}</p>
              )}
            </div>
          </div>

          {/* Treatment Details */}
          <div className="space-y-2">
            <label
              htmlFor="treatment"
              className="text-sm font-medium text-gray-700 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Treatment Details *
            </label>
            <textarea
              id="treatment"
              rows={3}
              placeholder="Describe the treatment administered..."
              {...register("treatment", { required: "Treatment details are required" })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.treatment ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.treatment && (
              <p className="text-sm text-red-600">{errors.treatment.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Any additional observations or notes..."
              {...register("notes")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Form Actions */}
          <motion.div
            className="flex justify-end gap-3 pt-4 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <RingLoader color="#ffffff" size={16} />
                  Creating...
                </>
              ) : (
                <>
                  <Syringe className="h-4 w-4" />
                  Add Treatment
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Heart, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAnimals } from "@/hooks/use-animal-hooks";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Serving form schema
const CreateServingSchema = z.object({
  femaleId: z.string().min(1, "Please select a female animal"),
  maleId: z.string().optional(),
  servedAt: z.string().min(1, "Please select a serving date"),
  outcome: z.enum(["SUCCESSFUL", "FAILED", "PENDING"]).default("PENDING"),
  pregnancyDate: z.string().optional(),
  actualBirthDate: z.string().optional(),
  notes: z.string().optional(),
});

type CreateServingInput = z.infer<typeof CreateServingSchema>;

interface ServingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ServingForm({ isOpen, onClose, onSuccess }: ServingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch all animals for the dropdown
  const { data: animalsData } = useAnimals({
    page: 1,
    limit: 1000, // Get all animals
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateServingInput>({
    resolver: zodResolver(CreateServingSchema),
    defaultValues: {
      femaleId: "",
      maleId: "",
      servedAt: new Date().toISOString().split("T")[0],
      outcome: "PENDING",
      pregnancyDate: "",
      actualBirthDate: "",
      notes: "",
    },
  });

  const watchedOutcome = watch("outcome");

  const onSubmit = async (data: CreateServingInput) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Create serving record via API
      const response = await fetch("/api/servings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...data,
          servedAt: new Date(data.servedAt),
          pregnancyDate: data.pregnancyDate
            ? new Date(data.pregnancyDate)
            : undefined,
          actualBirthDate: data.actualBirthDate
            ? new Date(data.actualBirthDate)
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create serving record");
      }

      toast({
        title: "Success",
        description: "Serving record created successfully",
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Serving creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create serving record";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Filter animals by gender
  const femaleAnimals =
    animalsData?.animals?.filter(
      (animal: { gender: string }) => animal.gender === "FEMALE"
    ) || [];

  const maleAnimals =
    animalsData?.animals?.filter(
      (animal: { gender: string }) => animal.gender === "MALE"
    ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Add Serving Record
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Female Animal Selection */}
            <div className="space-y-2">
              <label
                htmlFor="femaleId"
                className="text-sm font-medium text-gray-700"
              >
                Female Animal *
              </label>
              <select
                id="femaleId"
                {...register("femaleId")}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.femaleId ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a female animal</option>
                {femaleAnimals.map(
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
              {errors.femaleId && (
                <p className="text-sm text-red-600">
                  {errors.femaleId.message}
                </p>
              )}
            </div>

            {/* Male Animal Selection */}
            <div className="space-y-2">
              <label
                htmlFor="maleId"
                className="text-sm font-medium text-gray-700"
              >
                Male Animal
              </label>
              <select
                id="maleId"
                {...register("maleId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select a male animal (optional)</option>
                {maleAnimals.map(
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
            </div>

            {/* Serving Date */}
            <div className="space-y-2">
              <label
                htmlFor="servedAt"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Serving Date *
              </label>
              <Input
                id="servedAt"
                type="date"
                {...register("servedAt")}
                className={errors.servedAt ? "border-red-500" : ""}
              />
              {errors.servedAt && (
                <p className="text-sm text-red-600">
                  {errors.servedAt.message}
                </p>
              )}
            </div>

            {/* Outcome */}
            <div className="space-y-2">
              <label
                htmlFor="outcome"
                className="text-sm font-medium text-gray-700"
              >
                Outcome
              </label>
              <select
                id="outcome"
                {...register("outcome")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="PENDING">Pending</option>
                <option value="SUCCESSFUL">Successful</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Pregnancy Date - Show only if outcome is SUCCESSFUL */}
            {watchedOutcome === "SUCCESSFUL" && (
              <div className="space-y-2">
                <label
                  htmlFor="pregnancyDate"
                  className="text-sm font-medium text-gray-700"
                >
                  Expected Pregnancy Date
                </label>
                <Input
                  id="pregnancyDate"
                  type="date"
                  {...register("pregnancyDate")}
                />
              </div>
            )}

            {/* Actual Birth Date - Show only if outcome is SUCCESSFUL */}
            {watchedOutcome === "SUCCESSFUL" && (
              <div className="space-y-2">
                <label
                  htmlFor="actualBirthDate"
                  className="text-sm font-medium text-gray-700"
                >
                  Actual Birth Date
                </label>
                <Input
                  id="actualBirthDate"
                  type="date"
                  {...register("actualBirthDate")}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add any additional notes about the serving..."
              {...register("notes")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-pink-600 hover:bg-pink-700"
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
                  Creating...
                </>
              ) : (
                "Create Serving Record"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

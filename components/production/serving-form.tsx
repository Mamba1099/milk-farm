"use client";

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
import {
  useCreateServing,
  useUpdateServing,
  ServingRecord,
} from "@/hooks/use-production-hooks";
import { useToast } from "@/hooks/use-toast";
import {
  CreateServingSchema,
  CreateServingInput,
} from "@/lib/validators/animal";

interface ServingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  serving?: ServingRecord | null;
}

export function ServingForm({
  isOpen,
  onClose,
  onSuccess,
  serving,
}: ServingFormProps) {
  const { toast } = useToast();
  const createServingMutation = useCreateServing();
  const updateServingMutation = useUpdateServing();
  const isEditing = !!serving;

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
      femaleId: serving?.femaleId || "",
      servedAt:
        serving?.servedAt?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      outcome: serving?.outcome || "PENDING",
      pregnancyDate: serving?.pregnancyDate?.split("T")[0] || "",
      actualBirthDate: serving?.actualBirthDate?.split("T")[0] || "",
      notes: serving?.notes || "",
    },
  });

  const watchedOutcome = watch("outcome");

  const onSubmit = async (data: CreateServingInput) => {
    try {
      const servingData = {
        ...data,
        servedAt: new Date(data.servedAt),
        pregnancyDate: data.pregnancyDate
          ? new Date(data.pregnancyDate)
          : undefined,
        actualBirthDate: data.actualBirthDate
          ? new Date(data.actualBirthDate)
          : undefined,
      };

      if (isEditing && serving) {
        await updateServingMutation.mutateAsync({
          id: serving.id,
          ...servingData,
        });
        toast({
          title: "Success",
          description: "Serving record updated successfully",
        });
      } else {
        await createServingMutation.mutateAsync(servingData);
        toast({
          title: "Success",
          description: "Serving record created successfully",
        });
      }

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Serving operation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} serving record`;

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            {isEditing ? "Edit Serving Record" : "Add Serving Record"}
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
              disabled={
                createServingMutation.isPending ||
                updateServingMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createServingMutation.isPending ||
                updateServingMutation.isPending
              }
              className="bg-pink-600 hover:bg-pink-700"
            >
              {createServingMutation.isPending ||
              updateServingMutation.isPending ? (
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
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Serving Record"
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

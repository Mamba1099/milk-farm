"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RingLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateServing } from "@/hooks/use-serving-hooks";
import { useAnimals } from "@/hooks/use-animal-hooks";
import type { CreateServingData } from "@/lib/types/serving";

interface ServingFormProps {
  onCancel?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function ServingForm({ onCancel, onClose, onSuccess }: ServingFormProps): React.ReactElement {
  const [formData, setFormData] = useState<CreateServingData>({
    femaleId: "",
    bullName: "",
    servingType: "AI",
    ovaType: "NORMAL", 
    dateServed: new Date().toISOString().split('T')[0],
    servedBy: "",
    notes: "",
  });

  const createServing = useCreateServing();
  const { data: animals } = useAnimals();

  const femaleAnimals = animals?.animals?.filter(
    (animal: any) => animal.gender === "FEMALE" && animal.type === "COW"
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = formData.dateServed;
    const now = new Date();
    const [year, month, day] = selectedDate.split('-');
    const isoDateTime = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
    ).toISOString();
    
    if (!formData.femaleId) {
      alert("Please select a female animal");
      return;
    }
    if (formData.servingType === "BULL" && !formData.bullName) {
      alert("Please enter the bull name");
      return;
    }
    if (!formData.servedBy) {
      alert("Please enter who served the animal");
      return;
    }

    const submitData = {
      ...formData,
      dateServed: isoDateTime,
    };

    try {
      await createServing.mutateAsync(submitData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating serving record:", error);
    }
  };

  const handleInputChange = (field: keyof CreateServingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Female Animal Selection */}
        <div className="space-y-2">
          <Label htmlFor="femaleId">Female Animal *</Label>
          <Select
            value={formData.femaleId}
            onValueChange={(value) => handleInputChange("femaleId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select female animal to be served" />
            </SelectTrigger>
            <SelectContent>
              {femaleAnimals.map((animal: any) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.name || "Unnamed"} - #{animal.tagNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Serving Type */}
        <div className="space-y-2">
          <Label htmlFor="servingType">Serving Type *</Label>
          <Select
            value={formData.servingType}
            onValueChange={(value) => handleInputChange("servingType", value as "BULL" | "AI")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select serving type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AI">Artificial Insemination (AI)</SelectItem>
              <SelectItem value="BULL">Natural Service (Bull)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bull Name (only for BULL serving type) */}
        {formData.servingType === "BULL" && (
          <div className="space-y-2">
            <Label htmlFor="bullName">Bull Name *</Label>
            <Input
              id="bullName"
              type="text"
              placeholder="Enter the name of the bull"
              value={formData.bullName || ""}
              onChange={(e) => handleInputChange("bullName", e.target.value)}
              required
            />
          </div>
        )}

        {/* Ova Type */}
        <div className="space-y-2">
          <Label htmlFor="ovaType">Ova Type *</Label>
          <Select
            value={formData.ovaType}
            onValueChange={(value) => handleInputChange("ovaType", value as "PREDETERMINED" | "NORMAL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ova type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">Normal Ova</SelectItem>
              <SelectItem value="PREDETERMINED">Predetermined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Served */}
        <div className="space-y-2">
          <Label htmlFor="dateServed">Date Served *</Label>
          <Input
            id="dateServed"
            type="date"
            value={formData.dateServed}
            onChange={(e) => handleInputChange("dateServed", e.target.value)}
            required
          />
        </div>

        {/* Served By */}
        <div className="space-y-2">
          <Label htmlFor="servedBy">Served By *</Label>
          <Input
            id="servedBy"
            type="text"
            placeholder="Name of veterinarian or person who performed the service"
            value={formData.servedBy}
            onChange={(e) => handleInputChange("servedBy", e.target.value)}
            required
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            placeholder="Additional notes about the serving..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          {(onCancel || onClose) && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || onClose}
              disabled={createServing.isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={createServing.isPending}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {createServing.isPending && (
              <RingLoader size={16} color="white" />
            )}
            {createServing.isPending ? "Creating..." : "Create Serving Record"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default ServingForm;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCreateProduction } from "@/hooks";
import { useToast } from "@/hooks";

// Animation variants
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AddProductionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createProductionMutation = useCreateProduction();

  const [formData, setFormData] = useState({
    animalTag: "",
    date: new Date().toISOString().split("T")[0],
    morningYield: "",
    eveningYield: "",
    quality: "GRADE_A",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        morningYield: parseFloat(formData.morningYield) || 0,
        eveningYield: parseFloat(formData.eveningYield) || 0,
      };

      await createProductionMutation.mutateAsync(submitData);

      toast({
        title: "Success",
        description: "Production record added successfully",
      });

      router.push("/production");
    } catch (error: unknown) {
      console.error("Error creating production record:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add production record";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-6 sm:mb-8"
          variants={fadeInUp}
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add Production Record
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Record daily milk production data</p>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label
                    htmlFor="animalTag"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Animal Tag Number *
                  </label>
                  <Input
                    id="animalTag"
                    name="animalTag"
                    value={formData.animalTag}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter animal tag number"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Production Date *
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="morningYield"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Morning Yield (Liters)
                  </label>
                  <Input
                    id="morningYield"
                    name="morningYield"
                    type="number"
                    step="0.1"
                    value={formData.morningYield}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="eveningYield"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Evening Yield (Liters)
                  </label>
                  <Input
                    id="eveningYield"
                    name="eveningYield"
                    type="number"
                    step="0.1"
                    value={formData.eveningYield}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="quality"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Milk Quality Grade
                  </label>
                  <select
                    id="quality"
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="GRADE_A">Grade A</option>
                    <option value="GRADE_B">Grade B</option>
                    <option value="GRADE_C">Grade C</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Additional notes about this production record..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-sm sm:text-base"
                >
                  {isSubmitting ? "Adding Record..." : "Add Production Record"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 sm:flex-none text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

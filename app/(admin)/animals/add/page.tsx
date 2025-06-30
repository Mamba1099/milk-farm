"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCreateAnimal } from "@/hooks";
import { useToast } from "@/hooks/use-toast";

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

export default function AddAnimalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createAnimalMutation = useCreateAnimal();

  const [formData, setFormData] = useState({
    tagNumber: "",
    name: "",
    type: "COW" as const,
    gender: "FEMALE" as const,
    birthDate: "",
    expectedMaturityDate: "",
    motherName: "",
    fatherName: "",
    healthStatus: "HEALTHY" as const,
    notes: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Client-side validation
      const errors: Record<string, string> = {};

      if (!formData.tagNumber || formData.tagNumber.trim() === "") {
        errors.tagNumber = "Tag number is required";
      }

      if (!formData.birthDate) {
        errors.birthDate = "Birth date is required";
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        if (birthDate > today) {
          errors.birthDate = "Birth date cannot be in the future";
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors({});

      // Prepare submit data with proper date conversion
      const submitData = {
        ...formData,
        birthDate: new Date(formData.birthDate),
        expectedMaturityDate: formData.expectedMaturityDate
          ? new Date(formData.expectedMaturityDate)
          : undefined,
        image: imageFile,
      };

      await createAnimalMutation.mutateAsync(submitData);

      toast({
        type: "success",
        title: "Success",
        description: "Animal added successfully",
      });

      router.push("/animals");
    } catch (error: unknown) {
      console.error("Error creating animal:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add animal";

      // Set form error for general errors
      setFormErrors({ general: errorMessage });

      toast({
        type: "error",
        title: "Error",
        description: errorMessage,
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
              Add New Animal
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Register a new animal in your farm management system
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-4 sm:p-6 lg:p-8">
            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{formErrors.general}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      name="tagNumber"
                      value={formData.tagNumber}
                      onChange={handleInputChange}
                      placeholder="Enter tag number"
                      required
                      className={`text-sm sm:text-base ${
                        formErrors.tagNumber ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.tagNumber && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.tagNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Optional)
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter animal name"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
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
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
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
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      required
                      className={`text-sm sm:text-base ${
                        formErrors.birthDate ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.birthDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.birthDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Maturity Date
                    </label>
                    <Input
                      type="date"
                      name="expectedMaturityDate"
                      value={formData.expectedMaturityDate}
                      onChange={handleInputChange}
                      className="text-sm sm:text-base"
                    />
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
                      name="healthStatus"
                      value={formData.healthStatus}
                      onChange={handleInputChange}
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
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="e.g., Bessie, Daisy, or Tag Number"
                      className="text-sm sm:text-base"
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
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="e.g., Thunder, Hercules, or Tag Number"
                      className="text-sm sm:text-base"
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
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
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
                  {isSubmitting ? "Adding Animal..." : "Add Animal"}
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
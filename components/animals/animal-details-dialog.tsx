"use client";

import { motion } from "framer-motion";
import { X, Heart, Activity, Calendar, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHealthStatusColor, getAnimalTypeColor } from "@/lib/utils";
import { calculateExactAge, formatDisplayDate, calculateDaysRemaining } from "@/lib/date-utils";
import { AnimalDetailsDialogProps } from "@/lib/types/animal";
import { RobustImage } from "@/components/ui/robust-image";

export function AnimalDetailsDialog({
  animal,
  isOpen,
  onClose,
}: AnimalDetailsDialogProps) {
  if (!isOpen) return null;

  const birth = typeof animal.birthDate === "string" ? new Date(animal.birthDate) : animal.birthDate;
  const { years, months } = calculateExactAge(birth);
  const age = `${years} year${years !== 1 ? "s" : ""}${
    months > 0 ? `, ${months} month${months !== 1 ? "s" : ""}` : ""
  }`;

  const formatDate = (date: string | Date) => {
    return formatDisplayDate(date, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              {animal.name || `Animal ${animal.tagNumber}`}
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
          <CardContent className="space-y-6">
            {/* Animal Image and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
                  {animal.image ? (
                    <RobustImage
                      src={animal.image}
                      alt={`${animal.name || animal.tagNumber} image`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">
                          No image available
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Health Status Badge */}
                  <div className="absolute top-2 right-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        animal.healthStatus === "HEALTHY"
                          ? "bg-green-500"
                          : animal.healthStatus === "SICK"
                          ? "bg-red-500"
                          : animal.healthStatus === "RECOVERING"
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                      }`}
                      title={animal.healthStatus}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag Number
                    </label>
                    <p className="text-lg font-semibold">{animal.tagNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <p className="text-lg">{animal.name || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getAnimalTypeColor(
                        animal.type
                      )}`}
                    >
                      {animal.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <p className="text-lg">{animal.gender}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Health Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(
                        animal.healthStatus
                      )}`}
                    >
                      {animal.healthStatus}
                    </span>
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maturity Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        animal.isMatured
                          ? "text-green-600 bg-green-100"
                          : "text-yellow-600 bg-yellow-100"
                      }`}
                    >
                      {animal.isMatured ? "Matured" : "Young"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Ready
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        animal.isReadyForProduction
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }`}
                    >
                      {animal.isReadyForProduction ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Age
                      </label>
                      <p className="text-lg">{age}</p>
                    </div>
                  </div>
                  {animal.weight && (
                    <div className="flex items-center space-x-2">
                      <Scale className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Weight
                        </label>
                        <p className="text-lg">{animal.weight} kg</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Parent Information */}
            {(animal.mother || animal.father) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animal.mother && (
                    <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                      <label className="block text-sm font-medium text-pink-700 mb-1">
                        Mother
                      </label>
                      <p className="font-semibold">
                        {animal.mother.name ||
                          `Animal ${animal.mother.tagNumber}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tag: {animal.mother.tagNumber}
                      </p>
                    </div>
                  )}
                  {animal.father && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Father
                      </label>
                      <p className="font-semibold">
                        {animal.father.name ||
                          `Animal ${animal.father.tagNumber}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tag: {animal.father.tagNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Treatments</span>
                  </div>
                  <span className="text-xl font-bold text-red-700">
                    {animal.treatments?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Production Records</span>
                  </div>
                  <span className="text-xl font-bold text-green-700">
                    {animal.productionRecords?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {animal.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700">{animal.notes}</p>
                </div>
              </div>
            )}

            {/* Birth Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Birth & Maturity Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <label className="block text-sm font-medium text-blue-700">
                        Birth Date
                      </label>
                      <p className="font-semibold">
                        {formatDate(animal.birthDate)}
                      </p>
                    </div>
                  </div>
                </div>
                {animal.expectedMaturityDate && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <label className="block text-sm font-medium text-green-700">
                          Expected Maturity Date
                        </label>
                        <p className="font-semibold">
                          {formatDate(animal.expectedMaturityDate)}
                        </p>
                        <p className="text-xs text-green-600">
                          {new Date(animal.expectedMaturityDate) <= new Date()
                            ? "Maturity date has passed"
                            : (() => {
                                const daysRemaining = calculateDaysRemaining(animal.expectedMaturityDate);
                                return daysRemaining === 1 
                                  ? "1 day remaining" 
                                  : `${daysRemaining} days remaining`;
                              })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

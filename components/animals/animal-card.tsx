"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RobustImage } from "@/components/ui/robust-image";
import { getHealthStatusColor, getAnimalTypeColor } from "@/lib/utils";
import { AnimalCardProps } from "@/lib/types/animal";

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export function AnimalCard({ animal, onView, onEdit, onDelete, canEdit = false }: AnimalCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(animal);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(animal.id);
    }
  };

  const handleView = () => {
    onView(animal);
  };

  const calculateAge = (birthDate: string | Date) => {
    const birth =
      typeof birthDate === "string" ? new Date(birthDate) : birthDate;
    return Math.floor(
      (new Date().getTime() - birth.getTime()) /
        (1000 * 60 * 60 * 24 * 365)
    );
  };

  return (
    <motion.div variants={cardVariants}>
      <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white h-full">
        {/* Animal Image */}
        <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
          {animal.image ? (
            <RobustImage
              src={animal.image}
              alt={`${animal.name || animal.tagNumber} image`}
              width={400}
              height={192}
              className="rounded-lg object-cover w-full h-48"
              fallbackText={animal.name || animal.tagNumber}
              unoptimized={false}
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
                <p className="text-xs text-gray-500">No image</p>
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

        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {animal.name || `Animal ${animal.tagNumber}`}
            </h3>
            <p className="text-gray-600 text-sm">Tag: {animal.tagNumber}</p>
          </div>
          <div className="flex gap-1 sm:gap-2 ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="p-1.5 sm:p-2"
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
            </Button>
            {canEdit && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                  className="p-1.5 sm:p-2"
                >
                  <Edit2 size={14} className="sm:w-4 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 p-1.5 sm:p-2"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Type:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getAnimalTypeColor(
                animal.type
              )}`}
            >
              {animal.type}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Gender:</span>
            <span className="font-medium text-sm">{animal.gender}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Health:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(
                animal.healthStatus
              )}`}
            >
              {animal.healthStatus}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Age:</span>
            <span className="font-medium text-sm">
              {calculateAge(animal.birthDate)} years
            </span>
          </div>
          {animal.isMatured !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Matured:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  animal.isMatured
                    ? "text-green-600 bg-green-100"
                    : "text-yellow-600 bg-yellow-100"
                }`}
              >
                {animal.isMatured ? "Yes" : "No"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart size={12} className="sm:w-3.5 sm:h-3 text-red-600 fill-red-600" />
              <span>{animal.treatments?.length || 0} treatments</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity size={12} className="sm:w-4.5 sm:h-4.5" />
              <span>{animal.productionRecords?.length || 0} records</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Heart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useAnimals, useDeleteAnimal } from "@/hooks";
import { useToast } from "@/hooks";
import { getHealthStatusColor, getAnimalTypeColor } from "@/lib/utils";

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
      ease: "easeOut",
    },
  },
};

export default function AnimalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedHealth, setSelectedHealth] = useState<string>("");
  const [page, setPage] = useState(1);

  const {
    data: animalsData,
    isLoading,
    error,
  } = useAnimals({
    page,
    limit: 12,
    search: searchTerm || undefined,
    type: selectedType || undefined,
    gender: selectedGender || undefined,
    healthStatus: selectedHealth || undefined,
  });

  const deleteAnimalMutation = useDeleteAnimal();

  const handleDeleteAnimal = async (animalId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this animal? This action cannot be undone."
      )
    ) {
      try {
        await deleteAnimalMutation.mutateAsync(animalId);
        toast({
          title: "Success",
          description: "Animal deleted successfully",
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete animal";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading animals</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Animal Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your farm animals, track health, and monitor production
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Link href="/animals/add">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base">
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Add Animal
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative lg:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search animals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="COW">Cow</option>
              <option value="BULL">Bull</option>
              <option value="CALF">Calf</option>
            </select>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Health Status</option>
              <option value="HEALTHY">Healthy</option>
              <option value="SICK">Sick</option>
              <option value="RECOVERING">Recovering</option>
              <option value="QUARANTINED">Quarantined</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("");
                setSelectedGender("");
                setSelectedHealth("");
              }}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Animals Grid */}
        {animalsData?.animals?.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {animalsData.animals.map((animal: unknown) => {
                const animalData = animal as {
                  id: string;
                  tagNumber: string;
                  name?: string;
                  type: string;
                  gender: string;
                  healthStatus: string;
                  birthDate: string;
                  isMatured: boolean;
                  image?: string;
                  treatments?: unknown[];
                  productionRecords?: unknown[];
                };

                return (
                  <motion.div key={animalData.id} variants={cardVariants}>
                    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white h-full">
                      {/* Animal Image */}
                      <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
                        {animalData.image ? (
                          <Image
                            src={animalData.image}
                            alt={`${
                              animalData.name || animalData.tagNumber
                            } image`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                              animalData.healthStatus === "HEALTHY"
                                ? "bg-green-500"
                                : animalData.healthStatus === "SICK"
                                ? "bg-red-500"
                                : animalData.healthStatus === "RECOVERING"
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                            }`}
                            title={animalData.healthStatus}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {animalData.name ||
                              `Animal ${animalData.tagNumber}`}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Tag: {animalData.tagNumber}
                          </p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-1.5 sm:p-2"
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                          {user?.role === "FARM_MANAGER" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="p-1.5 sm:p-2"
                              >
                                <Edit2 size={14} className="sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteAnimal(animalData.id)
                                }
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
                              animalData.type
                            )}`}
                          >
                            {animalData.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Gender:</span>
                          <span className="font-medium text-sm">
                            {animalData.gender}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Health:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(
                              animalData.healthStatus
                            )}`}
                          >
                            {animalData.healthStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Age:</span>
                          <span className="font-medium text-sm">
                            {Math.floor(
                              (new Date().getTime() -
                                new Date(animalData.birthDate).getTime()) /
                                (1000 * 60 * 60 * 24 * 365)
                            )}{" "}
                            years
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            Matured:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              animalData.isMatured
                                ? "text-green-600 bg-green-100"
                                : "text-yellow-600 bg-yellow-100"
                            }`}
                          >
                            {animalData.isMatured ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span>
                              {animalData.treatments?.length || 0} treatments
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span>
                              {animalData.productionRecords?.length || 0}{" "}
                              records
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {animalsData.pagination.pages > 1 && (
              <motion.div
                className="flex justify-center gap-2 flex-wrap"
                variants={fadeInUp}
              >
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="text-sm"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 sm:px-4 py-2 text-gray-700 text-sm">
                  Page {page} of {animalsData.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === animalsData.pagination.pages}
                  className="text-sm"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div className="text-center py-12" variants={fadeInUp}>
            <div className="text-gray-500 mb-4 text-sm sm:text-base">
              No animals found
            </div>
            {user?.role === "FARM_MANAGER" && (
              <Link href="/animals/add">
                <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base">
                  Add Your First Animal
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

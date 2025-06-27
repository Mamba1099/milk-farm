"use client";

import { useState } from "react";
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

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-600 bg-green-100";
      case "SICK":
        return "text-red-600 bg-red-100";
      case "RECOVERING":
        return "text-yellow-600 bg-yellow-100";
      case "QUARANTINED":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "COW":
        return "text-purple-600 bg-purple-100";
      case "BULL":
        return "text-blue-600 bg-blue-100";
      case "CALF":
        return "text-pink-600 bg-pink-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading animals</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Animal Management
            </h1>
            <p className="text-gray-600">
              Manage your farm animals, track health, and monitor production
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Plus size={20} />
              Add Animal
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search animals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="COW">Cow</option>
              <option value="BULL">Bull</option>
              <option value="CALF">Calf</option>
            </select>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="flex items-center gap-2"
            >
              <Filter size={20} />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Animals Grid */}
        {animalsData?.animals?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  treatments?: unknown[];
                  productionRecords?: unknown[];
                };

                return (
                  <Card
                    key={animalData.id}
                    className="p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {animalData.name || `Animal ${animalData.tagNumber}`}
                        </h3>
                        <p className="text-gray-600">
                          Tag: {animalData.tagNumber}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye size={16} />
                        </Button>
                        {user?.role === "FARM_MANAGER" && (
                          <>
                            <Button size="sm" variant="outline">
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAnimal(animalData.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            animalData.type
                          )}`}
                        >
                          {animalData.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{animalData.gender}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Health:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(
                            animalData.healthStatus
                          )}`}
                        >
                          {animalData.healthStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(animalData.birthDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 365)
                          )}{" "}
                          years
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Matured:</span>
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
                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Heart size={14} />
                          <span>
                            {animalData.treatments?.length || 0} treatments
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity size={14} />
                          <span>
                            {animalData.productionRecords?.length || 0} records
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {animalsData.pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 py-2 text-gray-700">
                  Page {page} of {animalsData.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === animalsData.pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No animals found</div>
            {user?.role === "FARM_MANAGER" && (
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Add Your First Animal
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Heart,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { ServingForm } from "@/components/production/serving-form";
import {
  useServings,
  ServingRecord,
  useDeleteServing,
} from "@/hooks/use-production-hooks";
import { formatDate } from "@/lib/utils";

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

export default function ServingRecordsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [showServingForm, setShowServingForm] = useState(false);
  const [editingServing, setEditingServing] = useState<ServingRecord | null>(
    null
  );

  // Hooks
  const deleteServingMutation = useDeleteServing();

  // Fetch serving records
  const {
    data: servingData,
    isLoading,
    refetch,
  } = useServings({
    page: 1,
    limit: 100,
    search: searchTerm || undefined,
    outcome: outcomeFilter || undefined,
  });

  const servings = servingData?.servings || [];

  const handleServingSuccess = () => {
    refetch();
  };

  const handleEdit = (serving: ServingRecord) => {
    setEditingServing(serving);
    setShowServingForm(true);
  };

  const handleDelete = async (servingId: string) => {
    if (
      window.confirm("Are you sure you want to delete this serving record?")
    ) {
      try {
        await deleteServingMutation.mutateAsync(servingId);
        refetch();
      } catch (error) {
        console.error("Error deleting serving:", error);
      }
    }
  };

  const handleFormClose = () => {
    setShowServingForm(false);
    setEditingServing(null);
  };

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
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8"
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
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Serving Records
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track breeding and serving activities for your animals
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Button
              onClick={() => setShowServingForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Add Serving Record
            </Button>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by animal tag or serving record..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Outcomes</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setOutcomeFilter("");
              }}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Serving Records List */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          {isLoading ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading serving records...</p>
              </div>
            </Card>
          ) : servings.length === 0 ? (
            <Card className="p-6 sm:p-8">
              <div className="text-center py-8 sm:py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-4 text-sm sm:text-base">
                  {searchTerm || outcomeFilter
                    ? "No serving records match your filters"
                    : "No serving records found"}
                </div>
                <p className="text-gray-400 mb-6 text-sm sm:text-base">
                  Start tracking breeding activities by adding serving records
                </p>
                {user?.role === "FARM_MANAGER" && (
                  <Button
                    onClick={() => setShowServingForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                  >
                    Add First Serving Record
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Female Animal</TableHead>
                      <TableHead>Served Date</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Pregnancy Date</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Served By</TableHead>
                      <TableHead>Notes</TableHead>
                      {user?.role === "FARM_MANAGER" && (
                        <TableHead>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servings.map((serving: ServingRecord) => (
                      <TableRow key={serving.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {serving.female?.tagNumber || serving.femaleId}
                            </Badge>
                            {serving.female?.name && (
                              <span className="text-sm text-gray-600">
                                {serving.female.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(serving.servedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              serving.outcome === "SUCCESSFUL"
                                ? "default"
                                : serving.outcome === "FAILED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {serving.outcome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {serving.pregnancyDate ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(serving.pregnancyDate)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {serving.actualBirthDate ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(serving.actualBirthDate)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {serving.servedBy?.username || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {serving.notes ? (
                            <div className="truncate" title={serving.notes}>
                              {serving.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        {user?.role === "FARM_MANAGER" && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(serving)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(serving.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Serving Form Modal */}
      {showServingForm && (
        <ServingForm
          isOpen={showServingForm}
          onClose={handleFormClose}
          onSuccess={handleServingSuccess}
          serving={editingServing}
        />
      )}
    </div>
  );
}

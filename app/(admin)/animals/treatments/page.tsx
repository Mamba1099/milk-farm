"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  Syringe,
  DollarSign,
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
import { useTreatments } from "@/hooks/use-animal-hooks";
import { TreatmentForm } from "@/components/animals/treatment-form";
import { formatDate, formatCurrency } from "@/lib/utils";

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

export default function TreatmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);

  const { data: treatmentsData, isLoading, refetch } = useTreatments();
  const treatments = treatmentsData?.treatments || [];

  // Filter treatments based on search term and type
  const filteredTreatments = treatments.filter((treatment: unknown) => {
    const matchesSearch =
      !searchTerm ||
      treatment.animal?.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.treatmentType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      treatment.treatment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      !treatmentType || treatment.treatmentType === treatmentType;

    return matchesSearch && matchesType;
  });

  const handleTreatmentSuccess = () => {
    refetch();
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
              Health Records
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track treatments and health interventions for your animals
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Button
              onClick={() => setShowTreatmentForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Add Treatment
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
                placeholder="Search by animal tag or treatment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Treatment Types</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Deworming">Deworming</option>
              <option value="Antibiotic">Antibiotic Treatment</option>
              <option value="Hoof Care">Hoof Care</option>
              <option value="Reproductive">Reproductive Treatment</option>
              <option value="General">General Treatment</option>
              <option value="Emergency">Emergency Treatment</option>
              <option value="Preventive">Preventive Care</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setTreatmentType("");
              }}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <Filter size={16} className="sm:w-5 sm:h-5" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Treatments List */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          {isLoading ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading treatments...</p>
              </div>
            </Card>
          ) : filteredTreatments.length === 0 ? (
            <Card className="p-6 sm:p-8">
              <div className="text-center py-8 sm:py-12">
                <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-4 text-sm sm:text-base">
                  {searchTerm || treatmentType
                    ? "No treatments match your filters"
                    : "No treatments found"}
                </div>
                <p className="text-gray-400 mb-6 text-sm sm:text-base">
                  Start tracking animal health by adding treatment records
                </p>
                {user?.role === "FARM_MANAGER" && (
                  <Button
                    onClick={() => setShowTreatmentForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                  >
                    Add First Treatment
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
                      <TableHead>Animal</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTreatments.map((treatment: unknown) => (
                      <TableRow key={treatment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {treatment.animal?.tag || treatment.animalId}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {treatment.treatmentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={treatment.treatment}>
                            {treatment.treatment}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(treatment.date)}
                          </div>
                        </TableCell>
                        <TableCell>{treatment.veterinarian || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(treatment.cost)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Treatment Form Modal */}
        <TreatmentForm
          isOpen={showTreatmentForm}
          onClose={() => setShowTreatmentForm(false)}
          onSuccess={handleTreatmentSuccess}
        />
      </motion.div>
    </div>
  );
}

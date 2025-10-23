"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { RingLoader } from "react-spinners";
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
import { useTreatments, useTreatmentDiseases, useTreatmentStatistics } from "@/hooks/use-animal-hooks";
import { TreatmentWithDetails } from "@/lib/types/animal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TreatmentStatsSummary } from "@/components/treatments/treatment-stats-summary";

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
      ease: [0.25, 0.1, 0.25, 1] as any,
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

  const { data: treatmentsData, isLoading } = useTreatments();
  const { data: diseasesData, isLoading: isLoadingDiseases } = useTreatmentDiseases();
  const { data: statisticsData, isLoading: isLoadingStats } = useTreatmentStatistics();
  
  const treatments = treatmentsData?.treatments || [];
  const diseases = diseasesData?.diseases || [];
  const statistics = statisticsData || null;

  const filteredTreatments = treatments.filter(
    (treatment: TreatmentWithDetails) => {
      const matchesSearch =
        !searchTerm ||
        treatment.animal?.tagNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        treatment.disease?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.treatment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        !treatmentType ||
        treatment.disease?.toLowerCase().includes(treatmentType.toLowerCase());

      return matchesSearch && matchesType;
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      <motion.div
        className="mx-2"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8"
          variants={fadeInUp}
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Health Records
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track treatments and health interventions for your animals
            </p>
          </div>
          {user?.role === "FARM_MANAGER" && (
            <Link href="/animals/treatments/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base">
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Add Treatment
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Treatment Statistics Summary */}
        <motion.div variants={fadeInUp}>
          {isLoadingStats ? (
            <Card className="p-6 mb-6">
              <div className="text-center py-4">
                <RingLoader color="#2563eb" size={30} className="mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading statistics...</p>
              </div>
            </Card>
          ) : statistics && statistics.summary ? (
            <TreatmentStatsSummary summary={statistics.summary} />
          ) : null}
        </motion.div>

        {/* Filters */}
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
                placeholder="Search by animal tag, disease, or treatment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <select
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoadingDiseases}
            >
              <option value="">All Diseases</option>
              {diseases.map((disease: string) => (
                <option key={disease} value={disease.toLowerCase()}>
                  {disease}
                </option>
              ))}
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

        {/* Treatment Table */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          {isLoading ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <RingLoader color="#2563eb" size={40} className="mx-auto mb-4" />
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
                  <Link href="/animals/treatments/add">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base">
                      Add First Treatment
                    </Button>
                  </Link>
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
                      <TableHead>Disease</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTreatments.map((treatment: TreatmentWithDetails) => (
                      <TableRow key={treatment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {treatment.animal?.tagNumber ||
                                treatment.animalId}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{treatment.disease}</Badge>
                        </TableCell>
                        <TableCell className="w-full sm:w-64 md:w-80 lg:w-96">
                          <div className="flex items-start min-w-[19rem] max-w-[28rem] break-words whitespace-normal leading-relaxed">
                            {treatment.treatment}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(treatment.treatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {treatment.treatedBy || "-"}
                        </TableCell>
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
      </motion.div>
    </div>
  );
}

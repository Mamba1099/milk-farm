"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Milk } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  useProductionData,
  useProductionStats,
} from "@/hooks/use-production-hooks";
import { useAnimals } from "@/hooks/use-animal-hooks";
import { ProductionRecordsList } from "@/components/production/production-records-list";
import { ProductionFilters } from "@/components/production/production-filters";
import { DayEndTimer } from "@/components/production/day-end-timer";

const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function ProductionPage() {
  const { user, canEdit } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [viewTab, setViewTab] = useState<"production" | "calves">("production");

  const {
    records,
    isLoading: productionLoading,
    refetch: refetchProduction,
  } = useProductionData(selectedDateRange, customDate);
  const { data: stats, isLoading: statsLoading } = useProductionStats();
  // filterDate logic is no longer needed for morning stat
  const nonCalfRecords = records?.filter(record => record.animal.type !== "CALF") || [];
  const currentMorningTotal = nonCalfRecords.reduce((sum: number, record: any) => sum + (record.quantity_am || 0), 0);
  const currentEveningTotal = nonCalfRecords.reduce((sum: number, record: any) => sum + (record.quantity_pm || 0), 0);
  const currentTotalProduction = currentMorningTotal + currentEveningTotal;


  // If you still need yesterdayBalance, use selectedDateRange/customDate logic
  // Example: for 'custom', use customDate; otherwise, use today
  let yesterdayBalance = 0;
  let selectedDay: Date | undefined = undefined;
  if (selectedDateRange === "custom" && customDate) {
    selectedDay = new Date(Date.UTC(customDate.getUTCFullYear(), customDate.getUTCMonth(), customDate.getUTCDate()));
  } else {
    const now = new Date();
    selectedDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  if (records && records.length > 0 && selectedDay) {
    const yesterday = new Date(selectedDay.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getUTCFullYear() === yesterday.getUTCFullYear() &&
        recordDate.getUTCMonth() === yesterday.getUTCMonth() &&
        recordDate.getUTCDate() === yesterday.getUTCDate();
    });
    yesterdayBalance = yesterdayRecords.reduce((sum, record) => sum + (record.balance_pm || 0), 0);
  }



  const { data: calvesData, isLoading: calvesLoading } = useAnimals({ 
    limit: 1000, 
    type: "CALF" 
  });

  const allProductions = records || [];
  const calves = calvesData?.animals || [];
  
  const filteredProductionData = allProductions.filter(
    (record: any) =>
      record.animal.tagNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animal.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats object with filtered and unfiltered data
  const productionStats = {
    // These adjust with date filter (filtered data)
    todayProduction: currentTotalProduction,
    morningTotal: currentMorningTotal,
    eveningTotal: currentEveningTotal,
    // These remain constant (unfiltered accumulation data)
    weekProduction: stats?.weekProduction || 0,
    monthProduction: stats?.monthProduction || 0,
    activeAnimals: stats?.activeAnimals || 0,
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDateRange("today");
    setCustomDate(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6">
      {/* Day-end timer (runs in background for all users: employees, farm managers, admins) */}
      <DayEndTimer 
        dayEndHour={24}
        triggerMinutesBefore={60}
        isActive={true}
      />
      <motion.div className="mx-2" initial="initial" animate="animate" variants={staggerContainer}>
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4" variants={fadeInUp}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Production Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track daily milk production and calf feeding records
            </p>
          </div>
          {canEdit && (
            <Button
              onClick={() => router.push("/production/add")}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <Milk size={18} className="sm:w-5 sm:h-5" />
              Add Production
            </Button>
          )}
        </motion.div>

        {/* Production Filters */}
        <motion.div variants={fadeInUp}>
          <ProductionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateFilter={selectedDateRange}
            onDateFilterChange={setSelectedDateRange}
            customDate={customDate}
            onCustomDateChange={setCustomDate}
            onClearFilters={handleClearFilters}
          />
        </motion.div>

        {/* Production Statistics & Records */}
        <ProductionRecordsList
          records={filteredProductionData}
          stats={productionStats}
          userRole={user?.role}
          showStats={true}
          title="Production Records"
          viewTab={viewTab}
          setViewTab={setViewTab}
          calvesCount={calves.length}
        />
      </motion.div>
    </div>
  );
}

"use client";

import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimalFiltersProps } from "@/lib/types/animal";

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
    },
  },
};

export function AnimalFilters({ filters, onFiltersChange }: AnimalFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, selectedType: value });
  };

  const handleGenderChange = (value: string) => {
    onFiltersChange({ ...filters, selectedGender: value });
  };

  const handleHealthChange = (value: string) => {
    onFiltersChange({ ...filters, selectedHealth: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      selectedType: "",
      selectedGender: "",
      selectedHealth: "",
    });
  };

  return (
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
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <select
          value={filters.selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Types</option>
          <option value="COW">Cow</option>
          <option value="BULL">Bull</option>
          <option value="CALF">Calf</option>
        </select>
        <select
          value={filters.selectedGender}
          onChange={(e) => handleGenderChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Genders</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <select
          value={filters.selectedHealth}
          onChange={(e) => handleHealthChange(e.target.value)}
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
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <Filter size={16} className="sm:w-5 sm:h-5" />
          Clear Filters
        </Button>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";

interface SalesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  customDate?: Date;
  onCustomDateChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

export function SalesFilters({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  customDate,
  onCustomDateChange,
  onClearFilters,
}: SalesFiltersProps) {
  const [showCustomDate, setShowCustomDate] = useState(dateFilter === "custom");

  const handleDateFilterChange = (value: string) => {
    onDateFilterChange(value);
    if (value === "custom") {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      onCustomDateChange(undefined);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Date Range Filter */}
        <select
          value={dateFilter}
          onChange={(e) => handleDateFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Date</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        {/* Custom Date Picker - Show when custom is selected */}
        {showCustomDate ? (
          <div className="col-span-1">
            <DatePicker
              date={customDate}
              onDateChange={onCustomDateChange}
              placeholder="Select date"
              className="text-sm"
            />
          </div>
        ) : (
          <div className="col-span-1"></div>
        )}

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <Filter size={16} className="sm:w-5 sm:h-5" />
          Clear Filters
        </Button>
      </div>

      {/* Show selected custom date info */}
      {showCustomDate && customDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <CalendarIcon size={16} />
            <span>Showing sales for: {format(customDate, "PPP")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
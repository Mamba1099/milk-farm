"use client";

import { motion, type Variants } from "framer-motion";
import {
  DashboardHeader,
  ProfileCard,
  LivestockStatsCard,
  EmployeeOverviewCard,
  SystemOverviewCard,
  FarmSummaryCard,
  QuickAnalyticsOverview,
  RecentAnimalsCard,
  RoleBasedInfo,
  DayEndSummaryTrigger,
} from "@/components/dashboard";
import { DayEndTimer } from "@/components/production/day-end-timer";

const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9]">
      {/* Day-end timer (invisible component that runs in background) */}
      <DayEndTimer 
        dayEndHour={24}
        triggerMinutesBefore={60}
        isActive={true}
      />
      
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="p-4 sm:p-6"
      >
        {/* Header */}
        <DashboardHeader />

        {/* Dashboard Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <ProfileCard />
          <LivestockStatsCard />
          <EmployeeOverviewCard />
          <SystemOverviewCard />
          <FarmSummaryCard />
          <DayEndSummaryTrigger />
        </motion.div>

        {/* Quick Analytics Overview */}
        <QuickAnalyticsOverview />

        {/* Recent Animals */}
        <RecentAnimalsCard />

        {/* Role-based Information */}
        <RoleBasedInfo />
      </motion.div>
    </div>
  );
}

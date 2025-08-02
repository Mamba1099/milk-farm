"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useState } from "react";
import {
  FarmSettings,
  NotificationSettings,
  SecuritySettings,
  BackupSettings,
  SystemSettings,
} from "@/components/settings";

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
    },
  },
};

export default function SettingsPage() {
  const { canEdit } = useAuth();
  const [activeTab, setActiveTab] = useState("farm");

  const tabs = [
    { id: "farm", label: "Farm Settings", icon: Icons.settings },
    { id: "notifications", label: "Notifications", icon: Icons.mail },
    { id: "security", label: "Security", icon: Icons.shield },
    { id: "backup", label: "Backup & Data", icon: Icons.upload },
    { id: "system", label: "System", icon: Icons.settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "farm":
        return <FarmSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      case "backup":
        return <BackupSettings />;
      case "system":
        return <SystemSettings />;
      default:
        return <FarmSettings />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] p-4 sm:p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="mb-6 sm:mb-8" variants={fadeInUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage your farm settings and preferences
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar */}
          <motion.div className="lg:w-1/4" variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm sm:text-base ${
                        activeTab === tab.id
                          ? "bg-[#2d5523] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </motion.button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div className="lg:w-3/4" variants={fadeInUp}>
            {renderTabContent()}
          </motion.div>
        </div>

        {/* Role-based Information */}
        {!canEdit && (
          <motion.div
            className="mt-6 sm:mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icons.shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                View-Only Access
              </h3>
            </div>
            <p className="text-blue-700 text-xs sm:text-sm">
              You can view settings but cannot modify them. Contact your farm
              manager to request changes to system settings.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

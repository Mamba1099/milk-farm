"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";

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

export default function SettingsPage() {
  const { canEdit } = useAuth();
  const [activeTab, setActiveTab] = useState("farm");

  // Farm settings state
  const [farmSettings, setFarmSettings] = useState({
    farmName: "Green Valley Dairy Farm",
    location: "Valley County, CA",
    timezone: "America/Los_Angeles",
    currency: "USD",
    language: "English",
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowMilkProduction: true,
    animalHealth: true,
    systemMaintenance: false,
  });

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordPolicy: "standard",
  });

  const tabs = [
    { id: "farm", label: "Farm Settings", icon: Icons.settings },
    { id: "notifications", label: "Notifications", icon: Icons.mail },
    { id: "security", label: "Security", icon: Icons.shield },
    { id: "backup", label: "Backup & Data", icon: Icons.upload },
    { id: "system", label: "System", icon: Icons.settings },
  ];

  const renderFarmSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Name
            </label>
            <Input
              value={farmSettings.farmName}
              onChange={(e) =>
                setFarmSettings({ ...farmSettings, farmName: e.target.value })
              }
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              value={farmSettings.location}
              onChange={(e) =>
                setFarmSettings({ ...farmSettings, location: e.target.value })
              }
              disabled={!canEdit}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md disabled:bg-gray-100"
                value={farmSettings.timezone}
                onChange={(e) =>
                  setFarmSettings({ ...farmSettings, timezone: e.target.value })
                }
                disabled={!canEdit}
              >
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md disabled:bg-gray-100"
                value={farmSettings.currency}
                onChange={(e) =>
                  setFarmSettings({ ...farmSettings, currency: e.target.value })
                }
                disabled={!canEdit}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
          </div>
          {canEdit && (
            <Button className="bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-sm sm:text-base">
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-600">
                  Receive notifications via email
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email ? "bg-[#2d5523]" : "bg-gray-200"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() =>
                  canEdit &&
                  setNotifications({
                    ...notifications,
                    email: !notifications.email,
                  })
                }
                disabled={!canEdit}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Push Notifications
                </h4>
                <p className="text-sm text-gray-600">
                  Receive push notifications in browser
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.push ? "bg-[#2d5523]" : "bg-gray-200"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() =>
                  canEdit &&
                  setNotifications({
                    ...notifications,
                    push: !notifications.push,
                  })
                }
                disabled={!canEdit}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Low Milk Production Alerts
                </h4>
                <p className="text-sm text-gray-600">
                  Alert when production drops below threshold
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.lowMilkProduction
                    ? "bg-[#2d5523]"
                    : "bg-gray-200"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() =>
                  canEdit &&
                  setNotifications({
                    ...notifications,
                    lowMilkProduction: !notifications.lowMilkProduction,
                  })
                }
                disabled={!canEdit}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.lowMilkProduction
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Animal Health Alerts
                </h4>
                <p className="text-sm text-gray-600">
                  Notifications for health issues or checkups
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.animalHealth ? "bg-[#2d5523]" : "bg-gray-200"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() =>
                  canEdit &&
                  setNotifications({
                    ...notifications,
                    animalHealth: !notifications.animalHealth,
                  })
                }
                disabled={!canEdit}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.animalHealth
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          {canEdit && (
            <Button className="bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-sm sm:text-base">
              Save Preferences
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                security.twoFactorAuth ? "bg-[#2d5523]" : "bg-gray-200"
              } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() =>
                canEdit &&
                setSecurity({
                  ...security,
                  twoFactorAuth: !security.twoFactorAuth,
                })
              }
              disabled={!canEdit}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md disabled:bg-gray-100"
              value={security.sessionTimeout}
              onChange={(e) =>
                setSecurity({ ...security, sessionTimeout: e.target.value })
              }
              disabled={!canEdit}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Policy
            </label>
            <select
              className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md disabled:bg-gray-100"
              value={security.passwordPolicy}
              onChange={(e) =>
                setSecurity({ ...security, passwordPolicy: e.target.value })
              }
              disabled={!canEdit}
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="standard">
                Standard (8+ chars, numbers, symbols)
              </option>
              <option value="strict">
                Strict (12+ chars, mixed case, numbers, symbols)
              </option>
            </select>
          </div>

          {canEdit && (
            <div className="space-y-2">
              <Button className="bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-sm sm:text-base">
                Save Security Settings
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50 text-sm sm:text-base"
              >
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Backup & Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Automatic Backups
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Daily automated backups at 2:00 AM
              </p>
              <div className="text-xs sm:text-sm text-green-600">
                ✓ Last backup: Today, 2:00 AM
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Data Export
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Export all farm data as CSV or PDF
              </p>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 text-xs sm:text-sm"
                >
                  Export Data
                </Button>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="space-y-2">
              <Button className="bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-sm sm:text-base">
                Create Manual Backup
              </Button>
              <Button
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 text-sm sm:text-base"
              >
                Restore from Backup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-gray-800">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                System Version
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">v2.4.1</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                Last Update
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">
                December 15, 2024
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                Database Size
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">45.2 MB</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                Active Users
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">4 users</p>
            </div>
          </div>

          {canEdit && (
            <div className="space-y-2">
              <Button className="bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-sm sm:text-base">
                Check for Updates
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 text-sm sm:text-base"
              >
                View System Logs
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50 text-sm sm:text-base"
              >
                System Maintenance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "farm":
        return renderFarmSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "backup":
        return renderBackupSettings();
      case "system":
        return renderSystemSettings();
      default:
        return renderFarmSettings();
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

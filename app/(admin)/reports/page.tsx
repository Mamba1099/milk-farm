"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useState } from "react";
import {
  useOverviewReport,
  useProductionReport,
  useAnimalsReport,
  useTreatmentsReport,
} from "@/hooks/use-reports-hooks";
import {
  useAnimalStats,
  useProductionStats,
  useTreatmentStats,
} from "@/hooks/use-dashboard-hooks";

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

export default function ReportsPage() {
  const { canEdit } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(
    null
  );

  // Fetch real-time stats using dashboard hooks
  const { data: animalsStats, isLoading: animalsLoading } = useAnimalStats();
  const { data: productionStats, isLoading: productionLoading } =
    useProductionStats();
  const { data: treatmentsStats, isLoading: treatmentsLoading } =
    useTreatmentStats();

  // Fetch reports data
  const { data: overviewReport, isLoading: overviewLoading } =
    useOverviewReport(startDate, endDate);
  const { data: productionReport, isLoading: productionReportLoading } =
    useProductionReport(startDate, endDate);
  const { data: animalsReport, isLoading: animalsReportLoading } =
    useAnimalsReport(startDate, endDate);
  const { data: treatmentsReport, isLoading: treatmentsReportLoading } =
    useTreatmentsReport(startDate, endDate);

  // Calculate stats for display
  const totalAnimals = animalsStats?.total || 0;
  const healthyAnimals = animalsStats?.healthy || 0;
  const totalProduction = productionStats?.totalQuantity || 0;
  const totalTreatments = treatmentsStats?.total || 0;
  const treatmentCost = treatmentsStats?.totalCost || 0;
  const averageProduction = productionStats?.averageDaily || 0;

  const handleDateChange = (field: "start" | "end", value: string) => {
    if (field === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleViewReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setShowReportModal(true);
  };

  const handleExportReport = (reportType: string) => {
    // Handle export functionality - could download JSON or CSV
    let reportData;
    const fileName = `${reportType}_report_${
      new Date().toISOString().split("T")[0]
    }`;

    switch (reportType) {
      case "production":
        reportData = productionReport;
        break;
      case "animals":
        reportData = animalsReport;
        break;
      case "treatments":
        reportData = treatmentsReport;
        break;
      default:
        reportData = overviewReport;
    }

    if (reportData?.report) {
      const dataStr = JSON.stringify(reportData.report, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${fileName}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Farm Reports
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                View and generate comprehensive farm reports
              </p>
            </div>
            {canEdit && (
              <Button className="flex items-center gap-2 bg-[#2d5523] hover:bg-[#1e3a1a] text-white w-full sm:w-auto text-sm sm:text-base">
                <Icons.fileText className="h-4 w-4" />
                Generate Custom Report
              </Button>
            )}
          </div>
        </motion.div>

        {/* Report Filters */}
        <motion.div variants={fadeInUp}>
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-base sm:text-lg">
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <Input
                    type="date"
                    className="w-full"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <Input
                    type="date"
                    className="w-full"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-medium">
                      Total Production
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-800">
                      {productionLoading
                        ? "Loading..."
                        : `${totalProduction.toLocaleString()}L`}
                    </p>
                    <p className="text-xs text-blue-600">
                      {averageProduction > 0
                        ? `Avg: ${averageProduction.toFixed(1)}L/day`
                        : "No data"}
                    </p>
                  </div>
                  <Icons.milk className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs sm:text-sm font-medium">
                      Total Animals
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800">
                      {animalsLoading ? "Loading..." : totalAnimals}
                    </p>
                    <p className="text-xs text-green-600">
                      {animalsLoading
                        ? "Loading..."
                        : `${healthyAnimals} healthy`}
                    </p>
                  </div>
                  <Icons.cow className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-xs sm:text-sm font-medium">
                      Total Treatments
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-800">
                      {treatmentsLoading ? "Loading..." : totalTreatments}
                    </p>
                    <p className="text-xs text-orange-600">
                      {treatmentsLoading
                        ? "Loading..."
                        : `$${treatmentCost.toFixed(2)} spent`}
                    </p>
                  </div>
                  <Icons.shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-xs sm:text-sm font-medium">
                      System Status
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-800">
                      Active
                    </p>
                    <p className="text-xs text-purple-600">
                      All systems operational
                    </p>
                  </div>
                  <Icons.barChart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Available Reports */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Production Report */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
                  <Icons.milk className="h-4 w-4 sm:h-5 sm:w-5" />
                  Production Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Detailed milk production analytics with trends and forecasts.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm"
                    onClick={() => handleViewReport("production")}
                    disabled={productionReportLoading}
                  >
                    {productionReportLoading ? (
                      <>
                        <Icons.loader className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "View Report"
                    )}
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                      onClick={() => handleExportReport("production")}
                      disabled={!productionReport?.report}
                    >
                      Export JSON
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Animal Health Report */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 text-sm sm:text-base">
                  <Icons.cow className="h-4 w-4 sm:h-5 sm:w-5" />
                  Animal Health Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Comprehensive health status and medical history of all
                  animals.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm"
                    onClick={() => handleViewReport("animals")}
                    disabled={animalsReportLoading}
                  >
                    {animalsReportLoading ? (
                      <>
                        <Icons.loader className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "View Report"
                    )}
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                      onClick={() => handleExportReport("animals")}
                      disabled={!animalsReport?.report}
                    >
                      Export JSON
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Treatment Reports */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800 text-sm sm:text-base">
                  <Icons.shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  Treatment Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Animal treatment history, costs, and veterinary analytics.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm"
                    onClick={() => handleViewReport("treatments")}
                    disabled={treatmentsReportLoading}
                  >
                    {treatmentsReportLoading ? (
                      <>
                        <Icons.loader className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "View Report"
                    )}
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 text-xs sm:text-sm"
                      onClick={() => handleExportReport("treatments")}
                      disabled={!treatmentsReport?.report}
                    >
                      Export JSON
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Overview Reports */}
          {canEdit && (
            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800 text-sm sm:text-base">
                    <Icons.barChart className="h-4 w-4 sm:h-5 sm:w-5" />
                    Overview Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Comprehensive farm overview with all key metrics and trends.
                  </p>
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white text-xs sm:text-sm"
                      onClick={() => handleViewReport("overview")}
                      disabled={overviewLoading}
                    >
                      {overviewLoading ? (
                        <>
                          <Icons.loader className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "View Report"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm"
                      onClick={() => handleExportReport("overview")}
                      disabled={!overviewReport?.report}
                    >
                      Export JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Role-based Information */}
        {!canEdit && (
          <motion.div
            className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icons.shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                View-Only Access
              </h3>
            </div>
            <p className="text-blue-700 text-xs sm:text-sm">
              You can view reports but cannot generate or export custom reports.
              Contact your farm manager for advanced reporting features.
            </p>
          </motion.div>
        )}

        {/* Report Modal */}
        {showReportModal && selectedReportType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold capitalize">
                    {selectedReportType} Report
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportModal(false)}
                  >
                    <Icons.x className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedReportType === "production" && productionReport && (
                  <div>
                    <h3 className="font-semibold mb-4">Production Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="text-xl font-bold">
                          {productionReport.report.summary.totalQuantity}L
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Average Daily</p>
                        <p className="text-xl font-bold">
                          {productionReport.report.summary.averageDaily.toFixed(
                            1
                          )}
                          L
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Total Records</p>
                        <p className="text-xl font-bold">
                          {productionReport.report.summary.recordCount}
                        </p>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">Production by Animal</h4>
                    <div className="space-y-2">
                      {productionReport.report.byAnimal.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span>
                            {item.animal.tagNumber} -{" "}
                            {item.animal.name || "Unnamed"}
                          </span>
                          <span className="font-semibold">
                            {item.totalQuantity}L ({item.recordCount} records)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReportType === "animals" && animalsReport && (
                  <div>
                    <h3 className="font-semibold mb-4">Animals Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Total Animals</p>
                        <p className="text-xl font-bold">
                          {animalsReport.report.summary.totalAnimals}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-green-600">Healthy</p>
                        <p className="text-xl font-bold text-green-800">
                          {animalsReport.report.summary.healthyAnimals}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded">
                        <p className="text-sm text-yellow-600">Sick</p>
                        <p className="text-xl font-bold text-yellow-800">
                          {animalsReport.report.summary.sickAnimals}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded">
                        <p className="text-sm text-red-600">Injured</p>
                        <p className="text-xl font-bold text-red-800">
                          {animalsReport.report.summary.injuredAnimals}
                        </p>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">Animals by Type</h4>
                    <div className="space-y-2">
                      {Object.entries(animalsReport.report.summary.byType).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="capitalize">
                              {type.toLowerCase()}
                            </span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedReportType === "treatments" && treatmentsReport && (
                  <div>
                    <h3 className="font-semibold mb-4">Treatments Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">
                          Total Treatments
                        </p>
                        <p className="text-xl font-bold">
                          {treatmentsReport.report.summary.totalTreatments}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-xl font-bold">
                          $
                          {treatmentsReport.report.summary.totalCost.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600">Average Cost</p>
                        <p className="text-xl font-bold">
                          $
                          {treatmentsReport.report.summary.averageCost.toFixed(
                            2
                          )}
                        </p>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">Treatments by Animal</h4>
                    <div className="space-y-2">
                      {treatmentsReport.report.byAnimal.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span>
                              {item.animal.tagNumber} -{" "}
                              {item.animal.name || "Unnamed"}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({item.animal.healthStatus})
                            </span>
                          </div>
                          <span className="font-semibold">
                            {item.treatmentCount} treatments - $
                            {item.totalCost.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReportType === "overview" && overviewReport && (
                  <div>
                    <h3 className="font-semibold mb-4">Farm Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-blue-600">Total Animals</p>
                        <p className="text-xl font-bold text-blue-800">
                          {overviewReport.report.summary.totalAnimals}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-green-600">
                          Total Production
                        </p>
                        <p className="text-xl font-bold text-green-800">
                          {overviewReport.report.summary.totalProduction}L
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-purple-600">
                          Production Records
                        </p>
                        <p className="text-xl font-bold text-purple-800">
                          {overviewReport.report.summary.totalProductionRecords}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded">
                        <p className="text-sm text-orange-600">
                          Total Treatments
                        </p>
                        <p className="text-xl font-bold text-orange-800">
                          {overviewReport.report.summary.totalTreatments}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded">
                        <p className="text-sm text-red-600">Treatment Cost</p>
                        <p className="text-xl font-bold text-red-800">
                          $
                          {overviewReport.report.summary.totalTreatmentCost.toFixed(
                            2
                          )}
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded">
                        <p className="text-sm text-indigo-600">
                          Avg Production/Record
                        </p>
                        <p className="text-xl font-bold text-indigo-800">
                          {overviewReport.report.summary.averageProductionPerRecord.toFixed(
                            1
                          )}
                          L
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

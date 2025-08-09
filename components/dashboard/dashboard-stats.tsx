"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useDashboardStats } from "@/hooks";
import { ClockLoader } from "react-spinners";
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } },
};

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  gradient,
  children,
}) => (
  <motion.div variants={fadeInUp}>
    <Card
      className={`${gradient} hover:shadow-lg transition-all duration-300 h-full`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </motion.div>
);

const LoadingCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  gradient: string;
}> = ({ title, icon, gradient }) => (
  <StatCard title={title} icon={icon} gradient={gradient}>
    <div className="flex items-center justify-center py-12">
      <ClockLoader 
        color="#2d5523" 
        size={60} 
        speedMultiplier={0.8}
      />
    </div>
  </StatCard>
);

const ErrorCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  gradient: string;
  error: string;
}> = ({ title, icon, gradient, error }) => (
  <StatCard title={title} icon={icon} gradient={gradient}>
    <div className="text-center p-4">
      <Icons.alertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  </StatCard>
);

const NoDataCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  gradient: string;
  message: string;
}> = ({ title, icon, gradient, message }) => (
  <StatCard title={title} icon={icon} gradient={gradient}>
    <div className="text-center p-4">
      <Icons.database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </StatCard>
);

export const AnimalStatsCard: React.FC = () => {
  const { animals } = useDashboardStats();

  if (animals.isLoading) {
    return (
      <LoadingCard
        title="Animal Statistics"
        icon={<Icons.cow className="h-5 w-5 text-green-800" />}
        gradient="bg-gradient-to-br from-green-100 to-green-200 border-green-300"
      />
    );
  }

  if (animals.isError) {
    return (
      <ErrorCard
        title="Animal Statistics"
        icon={<Icons.cow className="h-5 w-5 text-green-800" />}
        gradient="bg-gradient-to-br from-green-100 to-green-200 border-green-300"
        error="Failed to load animal data"
      />
    );
  }

  if (!animals.data || animals.data.total === 0) {
    return (
      <NoDataCard
        title="Animal Statistics"
        icon={<Icons.cow className="h-5 w-5 text-green-800" />}
        gradient="bg-gradient-to-br from-green-100 to-green-200 border-green-300"
        message="No animals found. Add your first animal to get started!"
      />
    );
  }

  const stats = animals.data;

  return (
    <StatCard
      title="Animal Statistics"
      icon={<Icons.cow className="h-5 w-5 text-green-800" />}
      gradient="bg-gradient-to-br from-green-100 to-green-200 border-green-300"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {stats.total}
            </div>
            <div className="text-xs text-green-600">Total Animals</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {stats.healthy}
            </div>
            <div className="text-xs text-green-600">Healthy</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white/40 rounded">
            <div className="text-lg font-semibold text-green-700">
              {stats.cows}
            </div>
            <div className="text-xs text-green-600">Cows</div>
          </div>
          <div className="text-center p-2 bg-white/40 rounded">
            <div className="text-lg font-semibold text-green-700">
              {stats.bulls}
            </div>
            <div className="text-xs text-green-600">Bulls</div>
          </div>
          <div className="text-center p-2 bg-white/40 rounded">
            <div className="text-lg font-semibold text-green-700">
              {stats.calves}
            </div>
            <div className="text-xs text-green-600">Calves</div>
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Matured:</span>
            <span className="text-sm font-medium text-green-800">
              {stats.matured}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Sick:</span>
            <span className="text-sm font-medium text-red-600">
              {stats.sick}
            </span>
          </div>
          {stats.injured > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Injured:</span>
              <span className="text-sm font-medium text-orange-600">
                {stats.injured}
              </span>
            </div>
          )}
        </div>
      </div>
    </StatCard>
  );
};

export const ProductionStatsCard: React.FC = () => {
  const { production } = useDashboardStats();

  if (production.isLoading) {
    return (
      <LoadingCard
        title="Production Statistics"
        icon={<Icons.milk className="h-5 w-5 text-purple-800" />}
        gradient="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300"
      />
    );
  }

  if (production.isError) {
    return (
      <ErrorCard
        title="Production Statistics"
        icon={<Icons.milk className="h-5 w-5 text-purple-800" />}
        gradient="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300"
        error="Failed to load production data"
      />
    );
  }

  if (!production.data || production.data.totalRecords === 0) {
    return (
      <NoDataCard
        title="Production Statistics"
        icon={<Icons.milk className="h-5 w-5 text-purple-800" />}
        gradient="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300"
        message="No production records found. Start recording milk production!"
      />
    );
  }

  const stats = production.data;

  return (
    <StatCard
      title="Production Statistics"
      icon={<Icons.milk className="h-5 w-5 text-purple-800" />}
      gradient="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">
              {stats.todayQuantity}L
            </div>
            <div className="text-xs text-purple-600">
              Today&apos;s Production
            </div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">
              {stats.weeklyAverage}L
            </div>
            <div className="text-xs text-purple-600">Daily Average</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-600">Total Records:</span>
            <span className="text-sm font-medium text-purple-800">
              {stats.totalRecords}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-600">Weekly Total:</span>
            <span className="text-sm font-medium text-purple-800">
              {stats.weeklyTotal}L
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-600">Last Record:</span>
            <span className="text-sm font-medium text-purple-800">
              {stats.lastRecordDate
                ? new Date(stats.lastRecordDate).toLocaleDateString()
                : "No records"}
            </span>
          </div>
        </div>
        {stats.weeklyAverage > 0 && (
          <div className="mt-4 p-3 bg-white/40 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-700">
                {Math.round(
                  (stats.todayQuantity / stats.weeklyAverage) * 100 || 0
                )}
                %
              </div>
              <div className="text-xs text-purple-600">vs Daily Average</div>
            </div>
          </div>
        )}
      </div>
    </StatCard>
  );
};


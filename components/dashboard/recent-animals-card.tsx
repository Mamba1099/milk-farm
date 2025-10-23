"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { RobustImage } from "@/components/ui/robust-image";
import { getHealthStatusColor, getHealthStatusBadgeColor } from "@/lib/utils";
import { useAnimals } from "@/hooks/use-animal-hooks";
import type { Animal } from "@/lib/types";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

export function RecentAnimalsCard() {
  const { data: recentAnimalsData } = useAnimals({ page: 1, limit: 6 });
  const recentAnimals = recentAnimalsData?.animals || [];

  return (
    <motion.div variants={fadeInUp} className="mb-6 sm:mb-8">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Icons.cow className="h-5 w-5" />
            Recent Animals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAnimals.length === 0 ? (
            <div className="text-center py-8">
              <Icons.cow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No animals found
              </h3>
              <p className="text-gray-600">Add some animals to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAnimals.map((animal: Animal) => (
                <div
                  key={animal.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                      {animal.image ? (
                        <RobustImage
                          src={animal.image}
                          alt={`${animal.name || animal.tagNumber} image`}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover w-full h-full"
                          fallbackText={animal.name || animal.tagNumber}
                          unoptimized={false}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                          <Icons.cow className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {/* Health Status Badge */}
                      <div className="absolute top-1 right-1">
                        <div
                          className={`w-3 h-3 rounded-full ${getHealthStatusBadgeColor(animal.healthStatus)}`}
                          title={animal.healthStatus}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {animal.name || `Tag: ${animal.tagNumber}`}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {animal.type} • {animal.gender}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(animal.healthStatus)}`}
                        >
                          {animal.healthStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {recentAnimals.length > 0 && (
            <div className="mt-4 text-center">
              <a
                href="/animals"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all animals →
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } 
  },
};

export function QuickActionsCard() {
  const { canEdit } = useAuth();

  return (
    <motion.div variants={fadeInUp} className="mb-6 sm:mb-8">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Icons.analytics className="h-5 w-5" />
            Quick Actions & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/analytics"
              className="bg-white p-4 rounded-lg hover:shadow-md transition-all duration-200 border border-indigo-100 hover:border-indigo-300"
            >
              <div className="flex items-center gap-3">
                <Icons.barChart className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-800">
                    View Analytics
                  </p>
                  <p className="text-xs text-gray-600">
                    Detailed charts & trends
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/reports"
              className="bg-white p-4 rounded-lg hover:shadow-md transition-all duration-200 border border-purple-100 hover:border-purple-300"
            >
              <div className="flex items-center gap-3">
                <Icons.fileText className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-800">
                    Generate Reports
                  </p>
                  <p className="text-xs text-gray-600">
                    Export & analyze data
                  </p>
                </div>
              </div>
            </a>

            {canEdit && (
              <>
                <a
                  href="/animals/add"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition-all duration-200 border border-green-100 hover:border-green-300"
                >
                  <div className="flex items-center gap-3">
                    <Icons.cow className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Add Animal
                      </p>
                      <p className="text-xs text-gray-600">
                        Register new animal
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href="/production/add"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition-all duration-200 border border-blue-100 hover:border-blue-300"
                >
                  <div className="flex items-center gap-3">
                    <Icons.milk className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Record Production
                      </p>
                      <p className="text-xs text-gray-600">
                        Log daily production
                      </p>
                    </div>
                  </div>
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

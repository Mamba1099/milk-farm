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

export function ProfileCard() {
  const { user, canEdit, isFarmManager } = useAuth();

  return (
    <motion.div variants={fadeInUp}>
  <Card className="bg-gradient-to-br from-sky-200 to-sky-100 border-sky-300 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
            <Icons.user className="h-4 w-4 sm:h-5 sm:w-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Username:</span>
              <span className="text-md font-bold">
                {user?.username || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Role:</span>
              <span className="text-md font-bold">
                {isFarmManager ? "Farm Manager" : "Employee"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Access Level:</span>
              <span className="text-md font-bold">
                {canEdit ? "Full Access" : "Read Only"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Joined:</span>
              <span className="text-md font-bold">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

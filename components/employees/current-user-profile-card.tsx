"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Employee } from "@/lib/types/employee";

interface CurrentUserProfileCardProps {
  user: Employee;
  onEdit: () => void;
}

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    // Check for relative paths or data URLs
    return url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:");
  }
};

export const CurrentUserProfileCard: React.FC<CurrentUserProfileCardProps> = ({
  user,
  onEdit,
}) => {
  const imageUrl = user.image_url || user.image;
  const hasValidImage = isValidImageUrl(imageUrl);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-6 lg:gap-8">
              {/* Profile Image - Much Larger */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-gray-100 border-4 sm:border-6 border-gray-300 shadow-2xl">
                  {hasValidImage ? (
                    <Image
                      src={imageUrl as string}
                      alt={user.username}
                      fill
                      className="object-cover rounded-full"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icons.user className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 bg-green-500 rounded-full p-2 sm:p-3 shadow-lg">
                  <Icons.check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              {/* User Information - Better Layout */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight text-gray-900">
                    {user.username}
                  </h2>
                  <p className="text-gray-600 text-lg sm:text-xl mb-4">{user.email}</p>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.role === "FARM_MANAGER" 
                        ? "bg-green-100 text-green-800 border-green-300" 
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    }`}
                  >
                    {user.role === "FARM_MANAGER" ? (
                      <Icons.crown className="w-3 h-3 mr-1" />
                    ) : (
                      <Icons.shield className="w-3 h-3 mr-1" />
                    )}
                    {user.role === "FARM_MANAGER" ? "Farm Manager" : "Employee"}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:gap-6 text-gray-500">
                  <div className="flex items-center gap-2">
                    <Icons.calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Updated {new Date(user.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button - Moved to Far Right */}
              <div className="flex-shrink-0">
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 font-semibold border-blue-300"
                >
                  <Icons.edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

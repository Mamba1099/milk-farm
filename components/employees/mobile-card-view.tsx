"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Employee } from "@/lib/types/employee";
import { UserTableViewProps } from "@/lib/types/user-table";

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === '') return false;
  if (url.startsWith('/')) return true;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('blob:')) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }
};

const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export function MobileCardView({
  filteredUsers,
  canEdit,
  currentUser,
  onEditEmployee,
  onDeleteEmployee,
  canEditEmployee,
  canDeleteEmployee,
}: UserTableViewProps) {
  return (
    <motion.div 
      className="lg:hidden space-y-4"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {filteredUsers.map((userData: Employee) => (
        <motion.div
          key={userData.username}
          variants={cardVariants}
          className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {isValidImageUrl(userData.image_url || userData.image) ? (
                <img
                  src={(userData.image_url || userData.image) as string}
                  alt={userData.username}
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                  }}
                />
              ) : null}
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-300 shadow-sm"
                   style={{ display: isValidImageUrl(userData.image_url || userData.image) ? 'none' : 'flex' }}>
                <span className="text-white font-bold text-2xl">
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {userData.username}
                </h3>
                <span
                  className={`inline-flex items-center px-3 py-2 text-sm font-bold rounded-full border-2 self-start sm:self-auto ${
                    userData.role === "FARM_MANAGER"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-green-100 text-green-800 border-green-300"
                  }`}
                >
                  {userData.role === "FARM_MANAGER" ? (
                    <Icons.crown className="w-4 h-4 mr-1" />
                  ) : (
                    <Icons.user className="w-4 h-4 mr-1" />
                  )}
                  {userData.role.replace("_", " ")}
                </span>
              </div>
              
              <div className="mt-2">
                <p className="text-base font-semibold text-gray-800 flex items-center">
                  <Icons.mail className="w-5 h-5 mr-2 text-gray-600" />
                  {userData.email}
                </p>
              </div>
              
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                  <Icons.calendar className="w-5 h-5 mr-2 text-gray-600" />
                  <div>
                    <div className="font-bold text-gray-800">Joined</div>
                    <div className="font-semibold text-gray-700">
                      {new Date(userData.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                  <Icons.clock className="w-5 h-5 mr-2 text-gray-600" />
                  <div>
                    <div className="font-bold text-gray-800">Updated</div>
                    <div className="font-semibold text-gray-700">
                      {new Date(userData.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {canEdit && (canEditEmployee(userData) || canDeleteEmployee(userData)) && (
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  {canEditEmployee(userData) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditEmployee(userData)}
                      className="flex-1 text-blue-700 hover:text-blue-900 hover:bg-blue-100 font-semibold border-blue-300"
                    >
                      <Icons.edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                  )}
                  {canDeleteEmployee(userData) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteEmployee(userData)}
                      className="flex-1 text-red-700 hover:text-red-900 hover:bg-red-100 font-semibold border-red-300"
                    >
                      <Icons.trash className="w-4 h-4 mr-2" />
                      Delete User
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

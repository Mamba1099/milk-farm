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

export function DesktopTableView({
  filteredUsers,
  canEdit,
  currentUser,
  onEditEmployee,
  onDeleteEmployee,
  canEditEmployee,
  canDeleteEmployee,
}: UserTableViewProps) {
  return (
    <div className="hidden lg:block overflow-hidden rounded-lg border-2 border-gray-200 shadow-md">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Join Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              Last Updated
            </th>
            {canEdit && filteredUsers.some(user => canEditEmployee(user) || canDeleteEmployee(user)) && (
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <motion.tbody 
          className="bg-white divide-y divide-gray-200"
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
            <motion.tr
              key={userData.username}
              variants={cardVariants}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16">
                    {isValidImageUrl(userData.image_url || userData.image) ? (
                      <img
                        src={(userData.image_url || userData.image) as string}
                        alt={userData.username}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.removeAttribute('style');
                        }}
                      />
                    ) : null}
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-300 shadow-sm" 
                         style={{ display: isValidImageUrl(userData.image_url || userData.image) ? 'none' : 'flex' }}>
                      <span className="text-white font-bold text-xl">
                        {userData.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-bold text-gray-900">
                      {userData.username}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      ID: {userData.id ? "***" + userData.id.slice(-4) : "N/A"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base font-semibold text-gray-900">{userData.email}</div>
                <div className="text-sm font-medium text-gray-600">
                  <Icons.mail className="inline w-4 h-4 mr-1" />
                  Email Contact
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-3 py-2 text-sm font-bold rounded-full border-2 ${
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <Icons.calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <div>
                    <div className="font-bold text-gray-900">
                      {new Date(userData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {new Date(userData.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <Icons.clock className="w-5 h-5 mr-2 text-gray-500" />
                  <div>
                    <div className="font-bold text-gray-900">
                      {new Date(userData.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {new Date(userData.updatedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </td>
              {canEdit && (canEditEmployee(userData) || canDeleteEmployee(userData)) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {canEditEmployee(userData) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditEmployee(userData)}
                        className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 font-semibold border-blue-300"
                      >
                        <Icons.edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {canDeleteEmployee(userData) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteEmployee(userData)}
                        className="text-red-700 hover:text-red-900 hover:bg-red-100 font-semibold border-red-300"
                      >
                        <Icons.trash className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}

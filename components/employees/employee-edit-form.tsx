"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RingLoader } from "react-spinners";
import { Icons } from "@/components/icons";
import { useUpdateUser } from "@/hooks/use-employee-hooks";
import { Employee, UpdateEmployeeInput } from "@/lib/types/employee";
import { UpdateUserSchema } from "@/lib/validators/user";

interface EmployeeEditFormProps {
  user: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EmployeeEditForm({
  user,
  isOpen,
  onClose,
  onSuccess,
}: EmployeeEditFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UpdateUserSchema.omit({ id: true })),
    defaultValues: {
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    // Only include fields that have changed
    const finalData: UpdateEmployeeInput = {};
    if (data.username !== user.username) finalData.username = data.username;
    if (data.email !== user.email) finalData.email = data.email;
    if (data.role !== user.role) finalData.role = data.role;
    if (data.password && data.password.trim() !== "") finalData.password = data.password;
    if (imageFile) finalData.image = imageFile;

    updateUserMutation.mutate(
      { id: user.id, data: finalData },
      {
        onSuccess: () => {
          reset();
          resetImageUpload();
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const resetImageUpload = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleClose = () => {
    reset();
    resetImageUpload();
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = updateUserMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : user.image ? (
                    <Image
                      src={user.image}
                      alt="Current"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Icons.user className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Username"
                className={errors.username ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="Email"
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder="New Password (leave blank to keep current)"
                className={errors.password ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave blank to keep current password
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={watch("role")} 
                onValueChange={(value: "EMPLOYEE" | "FARM_MANAGER") => setValue("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="FARM_MANAGER">Farm Manager</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RingLoader size={16} color="white" />
                    Updating...
                  </div>
                ) : (
                  "Update Employee"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

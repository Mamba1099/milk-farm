"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RingLoader } from "react-spinners";
import { useCreateUser } from "@/hooks/use-employee-hooks";
import { useAuth } from "@/lib/auth-context";
import { registerSchema, RegisterInput } from "@/lib/validators/auth";
import { Check, X, Upload } from "lucide-react";
import { useState } from "react";

export default function EmployeeCreateForm() {
  const { isFarmManager } = useAuth();
  const createUserMutation = useCreateUser();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "EMPLOYEE" as const,
      image: undefined,
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  
  const passwordChecks = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ""),
    lowercase: /[a-z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
  };

  const allPasswordRequirementsMet = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && password && confirmPassword;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image must be less than 5MB");
        return;
      }
      
      // Validate file type
      const validTypes = [
        "image/jpeg", "image/jpg", "image/png", "image/gif",
        "image/webp", "image/bmp", "image/tiff", "image/svg+xml"
      ];
      
      if (!validTypes.includes(file.type)) {
        setImageError("Image must be a valid image file (JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG)");
        return;
      }
      
      setSelectedImage(file);
    }
  };

  const onSubmit = (data: any) => {
    // Clear any previous image errors
    setImageError(null);
    
    // For farm managers, force the role to EMPLOYEE
    const submissionData = {
      ...data,
      role: isFarmManager ? "EMPLOYEE" : data.role,
      image: selectedImage, // Include the selected image
    };

    // Use the regular createUser hook
    createUserMutation.mutate(submissionData);
  };

  const isLoading = createUserMutation.isPending;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...register("username")}
            placeholder="Enter username"
            className={errors.username ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="Enter password"
            className={errors.password ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
          
          {/* Password Requirements Check */}
          {password && (
            <div className="bg-gray-50 p-3 rounded border text-xs space-y-1">
              <div className={`flex items-center ${passwordChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordChecks.length ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                8+ characters
              </div>
              <div className={`flex items-center ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordChecks.uppercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                Uppercase letter
              </div>
              <div className={`flex items-center ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordChecks.lowercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                Lowercase letter
              </div>
              <div className={`flex items-center ${passwordChecks.number ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordChecks.number ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                Number
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm password"
            className={errors.confirmPassword ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
          {confirmPassword && (
            <div className={`flex items-center text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
              {passwordsMatch ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Profile Image (Optional)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={imageError ? "border-red-500" : ""}
              disabled={isLoading}
            />
            <Upload className="h-4 w-4 text-gray-400" />
          </div>
          {selectedImage && (
            <p className="text-xs text-green-600">Selected: {selectedImage.name}</p>
          )}
          {imageError && (
            <p className="text-sm text-red-600">{imageError}</p>
          )}
        </div>

        {/* Only show role selection if user is not a FARM_MANAGER */}
        {!isFarmManager && (
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={watch("role")} 
              onValueChange={(value) => setValue("role", value as "EMPLOYEE" | "FARM_MANAGER")}
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
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
        )}

        {/* Show info message for FARM_MANAGER */}
        {isFarmManager && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As a Farm Manager, you can only create Employee accounts. 
              The new user will be assigned the Employee role automatically.
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || !allPasswordRequirementsMet || !passwordsMatch}
          className={`w-full ${
            allPasswordRequirementsMet && passwordsMatch && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RingLoader size={16} color="white" />
              Creating...
            </div>
          ) : (
            isFarmManager ? "Create Employee" : "Create User"
          )}
        </Button>
      </form>
    </div>
  );
}

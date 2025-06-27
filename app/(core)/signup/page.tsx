"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useRegisterMutation } from "@/hooks";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Role = "farm_manager" | "employee";

export default function SignUpPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("employee"); // Default to employee
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (password !== confirmPassword) {
      toast.error("Password Mismatch", "Passwords do not match!");
      return;
    }

    // Prepare the registration data
    const registrationData = {
      username,
      email,
      password,
      confirmPassword,
      role,
      image: profileImage || undefined,
    };

    try {
      const result = await registerMutation.mutateAsync(registrationData);
      toast.success("Account Created", result.message);
      if (result.roleChanged) {
        toast.warning(
          "Role Changed",
          `You were registered as ${result.assignedRole} instead of ${result.originalRole}`
        );
      }
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      if (error && typeof error === "object" && "error" in error) {
        const registrationError = error as {
          error: string;
          details?: Array<{ field: string; message: string }>;
        };

        if (registrationError.details) {
          registrationError.details.forEach((detail) => {
            toast.error(`Validation Error: ${detail.field}`, detail.message);
          });
        } else {
          toast.error("Registration Failed", registrationError.error);
        }
      } else {
        toast.error(
          "Unexpected Error",
          "An unexpected error occurred. Please try again."
        );
      }
    }
  };

  const fadeInUp = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const roleOptions = [
    {
      value: "farm_manager",
      label: "Manager",
      description: "Full access to farm management",
    },
    {
      value: "employee",
      label: "Farm Employee",
      description: "Daily operations and data entry",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] flex items-center justify-center p-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#2d5523] flex items-center justify-center">
              <Icons.userPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#2d5523]">
              Create Account
            </CardTitle>
            <CardDescription className="text-[#4a6b3d]">
              Join our dairy farm management platform
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-[#2d5523]"
                >
                  Username
                </label>
                <div className="relative">
                  <Icons.user className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a6b3d]" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                </div>
              </div>

              {/* Profile Image Field */}
              <div className="space-y-2">
                <label
                  htmlFor="profileImage"
                  className="text-sm font-medium text-[#2d5523]"
                >
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover border-2 border-[#4a6b3d]/20"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-[#f7f5f2] border-2 border-dashed border-[#4a6b3d]/30 flex items-center justify-center">
                      <Icons.camera className="h-6 w-6 text-[#4a6b3d]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label
                      htmlFor="profileImageInput"
                      className="cursor-pointer inline-flex items-center px-3 py-2 border border-[#4a6b3d]/20 rounded-md text-sm font-medium text-[#4a6b3d] bg-white hover:bg-[#f7f5f2] transition-colors"
                    >
                      <Icons.upload className="mr-2 h-4 w-4" />
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </label>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-xs text-[#4a6b3d] mt-1">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#2d5523]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Icons.mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a6b3d]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-[#2d5523]"
                >
                  Role
                </label>
                <div className="relative">
                  <Icons.shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a6b3d]" />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full pl-10 pr-4 py-2 border border-[#4a6b3d]/20 rounded-md focus:border-[#2d5523] focus:ring-[#2d5523]/20 focus:outline-none bg-white text-[#2d5523]"
                    required
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-[#4a6b3d] mt-1">
                  {roleOptions.find((opt) => opt.value === role)?.description}
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#2d5523]"
                >
                  Password
                </label>
                <div className="relative">
                  <Icons.lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a6b3d]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4a6b3d] hover:text-[#2d5523] transition-colors"
                  >
                    {showPassword ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#2d5523]"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Icons.lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a6b3d]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4a6b3d] hover:text-[#2d5523] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={
                  registerMutation.isPending || password !== confirmPassword
                }
                className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white font-medium py-2.5 transition-colors disabled:opacity-50"
              >
                {registerMutation.isPending ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Icons.userPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#4a6b3d]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase"></div>
              </div>

              {/* Social Sign Up */}
              <div className="grid grid-cols-2 gap-3"></div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center text-sm text-[#4a6b3d]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#2d5523] hover:text-[#1e3a1a] font-medium hover:underline"
              >
                Log In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

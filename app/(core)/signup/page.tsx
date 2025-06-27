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
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-[#2d5523] flex items-center justify-center">
              <Icons.userPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-[#2d5523] mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-lg text-[#4a6b3d]">
              Join our dairy farm management platform
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-3">
                <label
                  htmlFor="username"
                  className="text-lg font-semibold text-[#2d5523]"
                >
                  Username
                </label>
                <div className="relative">
                  <Icons.user className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4a6b3d]" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-14 text-lg border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                </div>
              </div>

              {/* Profile Image Field */}
              <div className="space-y-3">
                <label
                  htmlFor="profileImage"
                  className="text-lg font-semibold text-[#2d5523]"
                >
                  Profile Picture
                </label>
                <div className="flex items-center space-x-6">
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover border-2 border-[#4a6b3d]/20"
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
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="text-lg font-semibold text-[#2d5523]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Icons.mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4a6b3d]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 text-lg border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label
                  htmlFor="role"
                  className="text-lg font-semibold text-[#2d5523]"
                >
                  Role
                </label>
                <div className="relative">
                  <Icons.shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4a6b3d] z-10" />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full pl-12 pr-4 py-4 text-lg border border-[#4a6b3d]/20 rounded-md focus:border-[#2d5523] focus:ring-[#2d5523]/20 focus:outline-none bg-white text-[#2d5523]"
                    required
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-[#4a6b3d] mt-2">
                  {roleOptions.find((opt) => opt.value === role)?.description}
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="text-lg font-semibold text-[#2d5523]"
                >
                  Password
                </label>
                <div className="relative">
                  <Icons.lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4a6b3d]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 text-lg border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4a6b3d] hover:text-[#2d5523] transition-colors"
                  >
                    {showPassword ? (
                      <Icons.eyeOff className="h-5 w-5" />
                    ) : (
                      <Icons.eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <label
                  htmlFor="confirmPassword"
                  className="text-lg font-semibold text-[#2d5523]"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Icons.lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4a6b3d]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 text-lg border-[#4a6b3d]/20 focus:border-[#2d5523] focus:ring-[#2d5523]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4a6b3d] hover:text-[#2d5523] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <Icons.eyeOff className="h-5 w-5" />
                    ) : (
                      <Icons.eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="text-sm text-red-500 mt-2">
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
                className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white font-semibold py-4 text-lg transition-colors disabled:opacity-50 mt-8"
              >
                {registerMutation.isPending ? (
                  <>
                    <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Icons.userPlus className="mr-3 h-5 w-5" />
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
            {/* Login Link */}
            <div className="mt-8 text-center text-lg text-[#4a6b3d]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#2d5523] hover:text-[#1e3a1a] font-semibold hover:underline text-lg"
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

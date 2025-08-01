"use client";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
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
import { useRegisterMutation, useFarmManagerExists } from "@/hooks";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ProfileImageField } from "@/components/auth/profile-image-field";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Role } from "@/lib/types";

export default function SignUpPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const { toast } = useToast();
  const { data: farmManagerExists, isLoading: checkingManager } = useFarmManagerExists();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (checkingManager) return;
    
    if (farmManagerExists) {
      setRole("EMPLOYEE");
      toast({
        type: "info",
        title: "Role Automatically Set",
        description: "Since a farm manager already exists, you'll be registered as an employee.",
      });
    } else {
      setRole("FARM_MANAGER");
    }
  }, [farmManagerExists, checkingManager, toast]);

  const handleImageChange = (file: File | null) => {
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        type: "error",
        title: "Password Mismatch",
        description: "Passwords do not match!",
      });
      return;
    }

    setIsRegistering(true);

    const registrationData = {
      username,
      email,
      password,
      confirmPassword,
      role,
      image: profileImage ?? null,
    };

    try {
      await registerMutation.mutateAsync(registrationData);
      router.push("/login");
    } catch (error) {
      console.error("Unexpected registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const fadeInUp: Variants = {
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
      value: "FARM_MANAGER",
      label: "Manager",
      description: "Full access to farm management",
    },
    {
      value: "EMPLOYEE",
      label: "Farm Employee",
      description: "Daily operations and data entry",
    },
  ];

  return (
    <>
      <LoadingOverlay 
        isVisible={isRegistering} 
        message="Creating your account and setting up your profile..." 
      />
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

              <ProfileImageField
                onImageChange={handleImageChange}
                imagePreview={imagePreview}
              />

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
                    disabled={checkingManager || farmManagerExists}
                    className="w-full pl-12 pr-4 py-4 text-lg border border-[#4a6b3d]/20 rounded-md focus:border-[#2d5523] focus:ring-[#2d5523]/20 focus:outline-none bg-white text-[#2d5523] disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  {checkingManager ? 
                    "Checking farm manager status..." : 
                    farmManagerExists ? 
                      "Role automatically set to Employee - Farm Manager already exists" : 
                      roleOptions.find((opt) => opt.value === role)?.description
                  }
                </p>
              </div>

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

              <Button
                type="submit"
                disabled={
                  isRegistering || password !== confirmPassword
                }
                className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white font-semibold py-4 text-lg transition-colors disabled:opacity-50 mt-8"
              >
                {isRegistering ? (
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#4a6b3d]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase"></div>
              </div>

              <div className="grid grid-cols-2 gap-3"></div>
            </form>

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
    </>
  );
}

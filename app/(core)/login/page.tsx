"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { LoginError } from "@/lib/types";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        type: "error",
        title: "Missing Fields",
        description: "Please fill in all fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast({
        type: "success",
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Login error:", error);
      
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        const loginError = axiosError.response?.data as LoginError;

        if (loginError?.details && Array.isArray(loginError.details)) {
          loginError.details.forEach((detail) => {
            toast({
              type: "error",
              title: `Validation Error: ${detail.field}`,
              description: detail.message,
            });
          });
        } else if (loginError?.error) {
          toast({
            type: "error",
            title: "Login Failed",
            description: loginError.error,
          });
        } else {
          toast({
            type: "error",
            title: "Login Failed",
            description: "Invalid credentials. Please try again.",
          });
        }
      } else {
        toast({
          type: "error",
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
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
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7f5f2] to-[#e8f5e9] flex items-center justify-center p-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-xl"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-[#2d5523] flex items-center justify-center">
              <Icons.user className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-[#2d5523] mb-2">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg text-[#4a6b3d]">
              Sign in to your dairy farm management account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Enter your password"
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
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2d5523] hover:bg-[#1e3a1a] text-white font-semibold py-4 text-lg transition-colors mt-8"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icons.logIn className="mr-3 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#4a6b3d]/20" />
                </div>
                <div className="relative flex justify-center text-sm uppercase"></div>
              </div>
            </form>

            <div className="mt-8 text-center text-lg text-[#4a6b3d]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#2d5523] hover:text-[#1e3a1a] font-semibold hover:underline text-lg"
              >
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

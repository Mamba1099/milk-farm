"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Milk } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      // Fallback to dashboard if back navigation fails
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Milk className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Page Not Found
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-200 mb-2">404</div>
              <p className="text-gray-500 text-sm mb-6">
                The requested resource could not be found on this farm.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/dashboard" className="block">
                <Button className="w-full" size="lg">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-400">
                If you believe this is an error, please contact your farm administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
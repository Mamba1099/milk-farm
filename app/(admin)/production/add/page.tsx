"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddProductionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main production page
    router.replace("/production");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Production Management...</p>
      </div>
    </div>
  );
}

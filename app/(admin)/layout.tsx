"use client";


import { ProtectedRoute } from "@/components/auth/protected-route";
import { DrawerNavigation } from "@/components/layout/drawer-navigation";
import { ToastProvider } from "@/components/ui/toast-provider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ToastProvider>
      <ProtectedRoute>
        <DrawerNavigation>{children}</DrawerNavigation>
      </ProtectedRoute>
    </ToastProvider>
  );
}

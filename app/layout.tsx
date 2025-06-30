import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";

export const metadata: Metadata = {
  title: "Milk Farm",
  description: "A Next.js application for managing a milk farm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthErrorBoundary>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}

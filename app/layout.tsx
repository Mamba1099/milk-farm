import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}

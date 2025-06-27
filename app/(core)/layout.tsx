
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Milk Farm",
  description:
    "A Next.js application for managing a milk farm",
};

export default function CoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-scree">
      <main className="flex">
        {children}
      </main>
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHealthStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "HEALTHY":
      return "bg-green-100 text-green-800";
    case "SICK":
      return "bg-red-100 text-red-800";
    case "RECOVERING":
      return "bg-yellow-100 text-yellow-800";
    case "QUARANTINED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getHealthStatusBadgeColor(status: string): string {
  switch (status.toUpperCase()) {
    case "HEALTHY":
      return "bg-green-500";
    case "SICK":
      return "bg-red-500";
    case "RECOVERING":
      return "bg-yellow-500";
    case "QUARANTINED":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
}

export function getAnimalTypeColor(type: string): string {
  switch (type.toUpperCase()) {
    case "COW":
      return "bg-purple-100 text-purple-800";
    case "BULL":
      return "bg-blue-100 text-blue-800";
    case "CALF":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

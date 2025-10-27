"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import type { CountdownTimerProps } from "@/lib/types";

export function CountdownTimer({ 
  targetDate, 
  showIcon = true, 
  className = "",
  size = "lg"
}: CountdownTimerProps & { size?: "sm" | "md" | "lg" }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const getDisplayText = (): string => {
    if (timeLeft.isExpired) {
      return "Time's up!";
    }
    
    const daysPart = timeLeft.days > 0 ? `${timeLeft.days}d ` : "";
    return `${daysPart}${formatTime(timeLeft.hours)}h ${formatTime(timeLeft.minutes)}m ${formatTime(timeLeft.seconds)}s`;
  };

  const getColorClass = (): string => {
    if (timeLeft.isExpired) {
      return "text-red-600";
    }
    
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    
    if (totalMinutes < 60) {
      return "text-red-500";
    } else if (totalMinutes < 24 * 60) {
      return "text-yellow-500";
    }
    return "text-green-600";
  };

  const sizeClasses = {
    sm: {
      container: "text-xs gap-1",
      icon: "h-3 w-3",
      text: "font-normal"
    },
    md: {
      container: "text-sm gap-1.5",
      icon: "h-4 w-4",
      text: "font-medium"
    },
    lg: {
      container: "text-base gap-2",
      icon: "h-5 w-5",
      text: "font-semibold"
    }
  };

  return (
    <div className={`flex items-center ${sizeClasses[size].container} ${getColorClass()} ${className}`}>
      {showIcon && <Clock className={`${sizeClasses[size].icon} shrink-0`} />}
      <span className={`font-mono ${sizeClasses[size].text}`}>
        {getDisplayText()}
      </span>
    </div>
  );
}
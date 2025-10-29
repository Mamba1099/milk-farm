"use client";

import { useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface DayEndTimerProps {
  dayEndHour?: number;
  triggerMinutesBefore?: number;
  isActive?: boolean;
}

export function DayEndTimer({ 
  dayEndHour = 24, 
  triggerMinutesBefore = 60,
  isActive = true 
}: DayEndTimerProps) {

  const triggerDayEndSummary = useCallback(async () => {
    try {
      
      const response = await apiClient.post("/api/production/day-end-summary", {
        date: new Date().toISOString()
      });

      if (response.status === 200 || response.status === 201) {
      }
    } catch (error) {
      console.error("❌ Failed to trigger day-end summary:", error);
    }
  }, []);

  const checkAndTrigger = useCallback(() => {
    if (!isActive) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let triggerHour = dayEndHour - Math.floor(triggerMinutesBefore / 60);
    let triggerMinute = 60 - (triggerMinutesBefore % 60);
    if (triggerMinute === 60) {
      triggerMinute = 0;
    } else if (triggerMinute > 0) {
      triggerHour -= 1;
    }
    if (triggerHour < 0) {
      triggerHour += 24;
    }
    const shouldTrigger = (
      currentHour === triggerHour && 
      currentMinute === triggerMinute
    );
    
    if (shouldTrigger) {
      triggerDayEndSummary();
    }
  }, [dayEndHour, triggerMinutesBefore, isActive, triggerDayEndSummary]);

  useEffect(() => {
    if (!isActive) return;
    checkAndTrigger();
    const interval = setInterval(checkAndTrigger, 60 * 1000);
    const triggerHour = dayEndHour - Math.floor(triggerMinutesBefore / 60);
    const triggerMinute = 60 - (triggerMinutesBefore % 60);
    return () => {
      clearInterval(interval);
    };
  }, [isActive, checkAndTrigger, dayEndHour, triggerMinutesBefore]);

  return null;
}
"use client";

import { useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface DayEndTimerProps {
  // Hour of the day when day ends (24-hour format, default: 24 = midnight)
  dayEndHour?: number;
  // How many minutes before day-end to trigger summary (default: 60 minutes)
  triggerMinutesBefore?: number;
  // Whether the timer is active (default: true)
  isActive?: boolean;
}

export function DayEndTimer({ 
  dayEndHour = 24, 
  triggerMinutesBefore = 60,
  isActive = true 
}: DayEndTimerProps) {

  const triggerDayEndSummary = useCallback(async () => {
    try {
      console.log("🕐 Triggering day-end summary calculation...");
      
      const response = await apiClient.post("/production/day-end-summary", {
        date: new Date().toISOString()
      });

      if (response.status === 200 || response.status === 201) {
        console.log("✅ Day-end summary completed successfully:", response.data);
        
        // You could show a notification here if needed
        // toast.success("Day-end summary completed successfully");
      }
    } catch (error) {
      console.error("❌ Failed to trigger day-end summary:", error);
      
      // You could show an error notification here
      // toast.error("Failed to complete day-end summary");
    }
  }, []);

  const checkAndTrigger = useCallback(() => {
    if (!isActive) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate trigger time (e.g., 11:00 PM for day ending at midnight with 60min buffer)
    let triggerHour = dayEndHour - Math.floor(triggerMinutesBefore / 60);
    let triggerMinute = 60 - (triggerMinutesBefore % 60);
    
    // Handle hour rollover
    if (triggerMinute === 60) {
      triggerMinute = 0;
    } else if (triggerMinute > 0) {
      triggerHour -= 1;
    }
    
    // Handle day rollover (e.g., if day ends at 1 AM, trigger at 12 AM)
    if (triggerHour < 0) {
      triggerHour += 24;
    }
    
    // Check if it's time to trigger (within 1-minute window)
    const shouldTrigger = (
      currentHour === triggerHour && 
      currentMinute === triggerMinute
    );
    
    if (shouldTrigger) {
      console.log(`🎯 Day-end trigger time reached: ${triggerHour}:${triggerMinute.toString().padStart(2, '0')}`);
      triggerDayEndSummary();
    }
  }, [dayEndHour, triggerMinutesBefore, isActive, triggerDayEndSummary]);

  useEffect(() => {
    if (!isActive) return;

    // Check immediately on mount
    checkAndTrigger();
    
    // Set up interval to check every minute
    const interval = setInterval(checkAndTrigger, 60 * 1000);
    
    // Log the timer setup
    const triggerHour = dayEndHour - Math.floor(triggerMinutesBefore / 60);
    const triggerMinute = 60 - (triggerMinutesBefore % 60);
    
    console.log(`📅 Day-end timer active. Will trigger at ${triggerHour}:${triggerMinute.toString().padStart(2, '0')} (${triggerMinutesBefore} minutes before day ends at ${dayEndHour === 24 ? '00:00' : dayEndHour + ':00'})`);

    return () => {
      clearInterval(interval);
      console.log("📅 Day-end timer cleaned up");
    };
  }, [isActive, checkAndTrigger, dayEndHour, triggerMinutesBefore]);

  // This component doesn't render anything visible
  return null;
}
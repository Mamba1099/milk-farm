"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calendar,
  Calculator,
  Lock,
  RefreshCw
} from "lucide-react";

interface DayEndSummaryTriggerProps {
  className?: string;
}

export function DayEndSummaryTrigger({ className }: DayEndSummaryTriggerProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastTriggerResult, setLastTriggerResult] = useState<{
    success: boolean;
    timestamp: Date;
    message: string;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEnabled, setIsEnabled] = useState(false);

  const { toast } = useToast();

  const isAfter10PM = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 22;
  };

  const getTimeUntil10PM = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (hour >= 22) {
      return "Available now";
    }
    
    const hoursLeft = 21 - hour;
    const minutesLeft = 60 - minute;
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m until 10 PM`;
    } else {
      return `${minutesLeft}m until 10 PM`;
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setIsEnabled(isAfter10PM());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const showLastResultToast = () => {
    if (!lastTriggerResult) return;
    
    if (lastTriggerResult.success) {
      toast({
        title: "✅ Day-End Summary Complete",
        description: `${lastTriggerResult.message} (Notification reshown)`,
        type: "success"
      });
    } else {
      toast({
        title: "❌ Day-End Summary Failed", 
        description: `${lastTriggerResult.message} (Notification reshown)`,
        type: "error",
      });
    }
  };

  const triggerDayEndSummary = async () => {
    if (!isAfter10PM()) {
      toast({
        title: "⏰ Too Early",
        description: "Day-end summary can only be triggered after 10 PM",
        type: "warning",
      });
      return;
    }

    setIsTriggering(true);
    try {
      
      const response = await apiClient.post("/production/day-end-summary", {
        date: new Date().toISOString()
      });

      if (response.status === 200 || response.status === 201) {
        const result = {
          success: true,
          timestamp: new Date(),
          message: response.data.message || "Day-end summary completed successfully"
        };
        
        setLastTriggerResult(result);
        
        const finalBalance = response.data?.summary?.finalBalance;
        const description = finalBalance !== undefined 
          ? `Summary complete! Final balance: ${finalBalance}L` 
          : result.message;
        
        toast({
          title: "✅ Day-End Summary Complete",
          description: description,
          type: "success"
        });
      }
    } catch (error: any) {
      const result = {
        success: false,
        timestamp: new Date(),
        message: error?.response?.data?.error || error?.message || "Failed to calculate day-end summary"
      };
      
      setLastTriggerResult(result);
      
      toast({
        title: "❌ Day-End Summary Failed",
        description: result.message,
        type: "error",
      });
      
      console.error("❌ Manual day-end summary failed:", error);
    } finally {
      setIsTriggering(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getNextAutoTrigger = () => {
    const now = new Date();
    const next = new Date();
    next.setHours(23, 0, 0, 0);
    
    if (now.getHours() >= 23) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Day-End Summary
              </CardTitle>
              <CardDescription className="text-amber-700 mt-1">
                Manual trigger for daily production & sales summary
                {!isEnabled && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Available after 10 PM
                  </Badge>
                )}
                {isEnabled && (
                  <Badge variant="default" className="ml-2 text-xs bg-green-600">
                    Available Now
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="text-right text-sm text-amber-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getCurrentTime()}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Trigger Button */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={triggerDayEndSummary}
              disabled={isTriggering || !isEnabled}
              className={`w-full font-medium py-2.5 transition-all duration-200 ${
                isEnabled 
                  ? "bg-amber-600 hover:bg-amber-700 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              size="lg"
            >
              {isTriggering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating Summary...
                </>
              ) : !isEnabled ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Available after 10 PM
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Trigger Day-End Summary Now
                </>
              )}
            </Button>
            
            {/* Time restriction notice */}
            {!isEnabled && (
              <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeUntil10PM()}</span>
                </div>
              </div>
            )}
            
            {/* Auto-trigger info */}
            <div className="text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Next auto-trigger: {getNextAutoTrigger()}</span>
              </div>
            </div>
          </div>

          {/* Last Result */}
          {lastTriggerResult && (
            <div className={`p-3 rounded-lg border ${
              lastTriggerResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                {lastTriggerResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={lastTriggerResult.success ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {lastTriggerResult.success ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {lastTriggerResult.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    lastTriggerResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {lastTriggerResult.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showLastResultToast()}
                  className="h-6 w-6 p-0 hover:bg-white/50 opacity-60 hover:opacity-100 transition-opacity"
                  title="Show toast notification again"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary Info */}
          <div className="text-xs text-amber-600 space-y-1">
            <p>📊 Calculates: Total production, calf feeding, net production, sales</p>
            <p>💾 Stores: Daily balance in ProductionSummary table</p>
            <p>⚡ Use when: Auto-trigger fails or need immediate summary</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
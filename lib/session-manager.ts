"use client";

interface SessionCheckMutation {
  mutateAsync: () => Promise<any>;
}

let checkInterval: NodeJS.Timeout | null = null;
let sessionCheckMutation: SessionCheckMutation | null = null;
let onSessionExpired: (() => void) | null = null;
let sessionInfo: {
  startTime: string;
  endTime: string;
  duration: number;
} | null = null;

export const sessionManager = {
  setSessionCheckMutation: (mutation: SessionCheckMutation) => {
    sessionCheckMutation = mutation;
  },

  setSessionInfo: (info: { startTime: string; endTime: string; duration: number }) => {
    sessionInfo = info;
  },

  startSessionCheck: (onExpired: () => void) => {
    onSessionExpired = onExpired;
    checkInterval = setInterval(() => {
      checkSession();
    }, 30 * 60 * 1000);
    checkSession();
  },

  stopSessionCheck: () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  },

  clearSession: () => {
  },
  checkSessionNow: () => {
    checkSession();
  }
};

async function checkSession() {
  if (!sessionCheckMutation) {
    return;
  }
  
  try {
    const result = await sessionCheckMutation.mutateAsync();
    if (result.session) {
      if (result.session.startTime && result.session.endTime && result.session.duration) {
        sessionInfo = {
          startTime: result.session.startTime,
          endTime: result.session.endTime,
          duration: result.session.duration,
        };
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number; data?: any } };
      
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        handleSessionExpired();
        return;
      }
    }
  }
}

function handleSessionExpired() {
  sessionManager.stopSessionCheck();
  if (onSessionExpired) {
    onSessionExpired();
  }
}

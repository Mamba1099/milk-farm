"use client";

interface SessionCheckMutation {
  mutateAsync: () => Promise<any>;
}

interface ToastFunction {
  (options: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    description?: string;
    duration?: number;
  }): void;
}

let checkInterval: NodeJS.Timeout | null = null;
let sessionCheckMutation: SessionCheckMutation | null = null;
let onSessionExpired: (() => void) | null = null;
let toastFunction: ToastFunction | null = null;
let sessionExpiryTimeout: NodeJS.Timeout | null = null;
let isHandlingSessionExpiry = false;
let hasShownExpiryToast = false;
let lastSessionCheck = 0;
let sessionInfo: {
  startTime: string;
  endTime: string;
  duration: number;
} | null = null;

export const sessionManager = {
  setSessionCheckMutation: (mutation: SessionCheckMutation) => {
    sessionCheckMutation = mutation;
  },

  setToastFunction: (toast: ToastFunction) => {
    toastFunction = toast;
  },

  setSessionInfo: (info: { startTime: string; endTime: string; duration: number }) => {
    sessionInfo = info;
    sessionManager.setupSessionExpiry(info.endTime);
  },

  setupSessionExpiry: (endTime: string) => {
    if (sessionExpiryTimeout) {
      clearTimeout(sessionExpiryTimeout);
    }

    const expiryTime = new Date(endTime).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpiry = expiryTime - currentTime;
    const fiveMinutesInMs = 5 * 60 * 1000;

    console.log(`Session will expire in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);

    if (timeUntilExpiry > fiveMinutesInMs) {
      const warningTime = timeUntilExpiry - fiveMinutesInMs;
      setTimeout(() => {
        if (toastFunction && !isHandlingSessionExpiry) {
          toastFunction({
            type: "warning",
            title: "Session Warning",
            description: "Your session will expire in 5 minutes. Please save your work.",
            duration: 10000
          });
        }
      }, warningTime);
    }

    if (timeUntilExpiry > 0) {
      sessionExpiryTimeout = setTimeout(() => {
        console.log("Session expired - clearing token and redirecting to login");
        handleSessionExpired();
      }, timeUntilExpiry);
    } else {
      console.log("Session has already expired");
      handleSessionExpired();
    }
  },

  startSessionCheck: (onExpired: () => void) => {
    onSessionExpired = onExpired;
    checkInterval = setInterval(() => {
      if (!isHandlingSessionExpiry) {
        checkSession();
      }
    }, 15 * 60 * 1000);
  
    if (!isHandlingSessionExpiry) {
      checkSession();
    }
  },

  stopSessionCheck: () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    if (sessionExpiryTimeout) {
      clearTimeout(sessionExpiryTimeout);
      sessionExpiryTimeout = null;
    }
  },

  clearSession: () => {
    sessionInfo = null;
    isHandlingSessionExpiry = false; 
    lastSessionCheck = 0;
    if (sessionExpiryTimeout) {
      clearTimeout(sessionExpiryTimeout);
      sessionExpiryTimeout = null;
    }
  },

  checkSessionNow: () => {
    checkSession();
  }
};

async function checkSession() {
  if (!sessionCheckMutation || isHandlingSessionExpiry) {
    return;
  }
  
  const now = Date.now();
  if (now - lastSessionCheck < 30000) {
    console.log("Skipping session check - too soon since last check");
    return;
  }
  lastSessionCheck = now;
  
  try {
    const result = await sessionCheckMutation.mutateAsync();
    
    if (result.session) {
      if (result.session.startTime && result.session.endTime && result.session.duration) {
        const newSessionInfo = {
          startTime: result.session.startTime,
          endTime: result.session.endTime,
          duration: result.session.duration,
        };
        
        if (!sessionInfo || sessionInfo.endTime !== newSessionInfo.endTime) {
          sessionInfo = newSessionInfo;
          sessionManager.setupSessionExpiry(newSessionInfo.endTime);
        }
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number; data?: any } };
      
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        console.log("Session validation failed - token is invalid or expired");
        handleSessionExpired();
        return;
      }
    }
    
    console.log("Session check error:", error);
  }
}

function handleSessionExpired() {
  if (isHandlingSessionExpiry) {
    console.log("Session expiry already being handled, skipping...");
    return;
  }
  
  isHandlingSessionExpiry = true;
  console.log("Handling session expiry...");
  
  if (toastFunction) {
    toastFunction({
      type: "warning",
      title: "Session Expired",
      description: "Your session has expired. You will be redirected to the login page.",
      duration: 5000
    });
  }
  
  sessionManager.stopSessionCheck();
  sessionManager.clearSession();
  
  if (onSessionExpired) {
    onSessionExpired();
  }
  
  setTimeout(() => {
    isHandlingSessionExpiry = false;
  }, 2000);
}

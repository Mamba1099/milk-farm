"use client";

interface SessionCheckMutation {
  mutateAsync: () => Promise<any>;
}

let checkInterval: NodeJS.Timeout | null = null;
let sessionCheckMutation: SessionCheckMutation | null = null;
let onSessionExpired: (() => void) | null = null;
let sessionExpiryTimeout: NodeJS.Timeout | null = null;
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
    sessionManager.setupSessionExpiry(info.endTime);
  },

  setupSessionExpiry: (endTime: string) => {
    if (sessionExpiryTimeout) {
      clearTimeout(sessionExpiryTimeout);
    }

    const expiryTime = new Date(endTime).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpiry = expiryTime - currentTime;

    console.log(`Session will expire in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);

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
      checkSession();
    }, 10 * 60 * 1000);
    
    checkSession();
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
  if (!sessionCheckMutation) {
    return;
  }
  
  try {
    const result = await sessionCheckMutation.mutateAsync();
    
    if (result.session) {
      if (result.session.startTime && result.session.endTime && result.session.duration) {
        // Update session info and setup expiry if it's new/different
        const newSessionInfo = {
          startTime: result.session.startTime,
          endTime: result.session.endTime,
          duration: result.session.duration,
        };
        
        // Only update if session info has changed
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
  console.log("Handling session expiry...");
  sessionManager.stopSessionCheck();
  sessionManager.clearSession();
  
  // Clear the session cookie by calling logout endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(error => {
      console.error("Error clearing session cookie:", error);
    });
  }
  
  if (onSessionExpired) {
    onSessionExpired();
  }
}

// Debug utility to check JWT token contents
// Run this in browser console to see what's in your token

function debugToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found in localStorage");
    return;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Invalid token format");
      return;
    }

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    console.log("Token payload:", payload);
    console.log("Role in token:", payload.role);
    console.log("Username:", payload.username);
    console.log("Email:", payload.email);
    console.log("Token expires:", new Date(payload.exp * 1000));
    console.log("Token issued:", new Date(payload.iat * 1000));
  } catch (error) {
    console.error("Failed to decode token:", error);
  }
}

// Run the debug function
debugToken();

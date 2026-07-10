export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Google OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
export const startLogin = () => {
  window.location.href = "/api/oauth/google";
};

// Logout function
export const logout = async () => {
  await fetch("/api/oauth/logout");
  window.location.href = "/";
};

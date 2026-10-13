// Minimal app params — no longer tied to Base44.
// The JWT token is stored/managed by src/api/client.js.
export const appParams = {
  appId: null,
  token: null,
  functionsVersion: null,
  appBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
};

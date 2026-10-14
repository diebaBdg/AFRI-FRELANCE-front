const TOKEN_KEY = "afrifreelance_token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function parseErrorPayload(raw, status) {
  if (!raw) return { message: `Request failed (${status})`, data: null };
  try {
    const data = JSON.parse(raw);
    if (typeof data === "string") return { message: data, data };
    const message =
      data.message ||
      data.error ||
      data.detail ||
      Object.values(data).find((v) => typeof v === "string") ||
      `Request failed (${status})`;
    return { message: String(message), data };
  } catch {
    return { message: raw.slice(0, 280) || `Request failed (${status})`, data: raw };
  }
}

export function isAbsent(err) {
  if (!err) return false;
  if (err.status === 404) return true;
  const code = err.data?.details?.code || err.data?.code;
  return ["NO_COMPANY", "NO_FREELANCE_PROFILE", "NO_CLIENT_PROFILE"].includes(code);
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  const text = await res.text();

  if (!res.ok) {
    const { message, data } = parseErrorPayload(text, res.status);
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  if (res.status === 204 || !text) return null;
  return JSON.parse(text);
}

async function uploadRequest(path, formData) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) {
    const { message } = parseErrorPayload(text, res.status);
    throw new Error(message);
  }
  if (!text) return null;
  return JSON.parse(text);
}

export function asArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.projects)) return payload.projects;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.users)) return payload.users;
  return [];
}

export { request, uploadRequest, API_BASE_URL };

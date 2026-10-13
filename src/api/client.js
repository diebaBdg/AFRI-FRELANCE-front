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

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let status = res.status;
    let data = null;
    try {
      data = await res.json();
      message = data.message || data.error || data.detail || message;
    } catch {
      // response has no JSON body
    }
    const error = new Error(message);
    error.status = status;
    error.data = data;
    throw error;
  }

  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
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
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

function buildQuery(filter, sort, limit) {
  const params = new URLSearchParams();
  if (filter && typeof filter === "object") {
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    }
  }
  if (sort) {
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    params.append("sort", `${field},${desc ? "desc" : "asc"}`);
  }
  if (limit) params.append("size", String(limit));
  if (limit) params.append("page", "0");
  return params.toString();
}

export { request, uploadRequest, buildQuery, API_BASE_URL };

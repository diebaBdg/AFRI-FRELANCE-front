import { request, getToken, setToken, clearToken, API_BASE_URL } from "./client";

async function me() {
  const token = getToken();
  if (!token) return null;
  try {
    return await request("/users/me");
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      clearToken();
      return null;
    }
    throw err;
  }
}

async function loginViaEmailPassword(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.token || data?.accessToken) {
    setToken(data.token || data.accessToken);
  }
  return data;
}

async function register({ email, password }) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data;
}

async function verifyOtp({ email, otpCode }) {
  const data = await request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp: otpCode }),
  });
  if (data?.token || data?.accessToken) {
    setToken(data.token || data.accessToken);
  }
  return data;
}

async function resendOtp(email) {
  return request("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

async function resetPasswordRequest(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

async function resetPassword({ resetToken, newPassword }) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: resetToken, newPassword }),
  });
}

async function updateMe(payload) {
  return request("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function logout(redirectUrl) {
  clearToken();
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
}

function redirectToLogin(returnTo) {
  const loginPath = "/login";
  const param = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  window.location.href = `${loginPath}${param}`;
}

function loginWithProvider(provider, returnTo) {
  const redirectUri = `${window.location.origin}/login`;
  window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export const auth = {
  me,
  loginViaEmailPassword,
  register,
  verifyOtp,
  resendOtp,
  resetPasswordRequest,
  resetPassword,
  updateMe,
  logout,
  redirectToLogin,
  loginWithProvider,
  setToken,
};

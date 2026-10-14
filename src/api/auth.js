import { request, getToken, setToken, clearToken, isAbsent } from "./client";
import { normalizeUser, toActiveMode, toPersonalInfoRequest } from "./normalize";

function persistToken(data) {
  const token = data?.token || data?.accessToken || data?.access_token;
  if (token) setToken(token);
  return token;
}

async function loadCurrentUser(loginPayload = {}) {
  const [info, summary] = await Promise.all([
    request("/api/profile/personal-info"),
    request("/api/profile/summary").catch(() => ({})),
  ]);
  return normalizeUser(info || {}, summary || {}, loginPayload);
}

async function me() {
  const token = getToken();
  if (!token) return null;
  try {
    return await loadCurrentUser();
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
    body: JSON.stringify({ login: email, password }),
  });
  persistToken(data);
  try {
    return await loadCurrentUser(data || {});
  } catch {
    return normalizeUser({}, {}, data || {});
  }
}

async function register({ email, password, confirmPassword, nom, prenom, phone }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      confirmPassword: confirmPassword || password,
      nom,
      prenom,
      phone,
    }),
  });
}

async function ensureModeProfile(mode, payload = {}) {
  if (mode === "FREELANCE") {
    try {
      await request("/api/profile/freelance");
    } catch (err) {
      if (!isAbsent(err)) throw err;
      await request("/api/profile/freelance", {
        method: "POST",
        body: JSON.stringify({
          title: payload.headline || payload.title || "Freelance",
          overview: payload.bio || payload.overview || "",
          country: payload.country,
          city: payload.city,
          currency: payload.defaultCurrency || payload.currency || "XOF",
          profileActive: true,
        }),
      });
    }
    return;
  }

  try {
    await request("/api/profile/client");
  } catch (err) {
    if (!isAbsent(err)) throw err;
    await request("/api/profile/client", {
      method: "POST",
      body: JSON.stringify({
        displayName: payload.fullName || payload.full_name || payload.display_name || "Client",
        clientType: payload.clientType || "INDIVIDUAL",
        overview: payload.bio || "",
        country: payload.country,
        city: payload.city,
        profileActive: true,
      }),
    });
  }
}

async function updateMe(payload) {
  if (payload?.account_type) {
    const mode = toActiveMode(payload.account_type);
    await ensureModeProfile(mode, payload);
    await request("/api/profile/active-mode", {
      method: "PUT",
      body: JSON.stringify({ mode }),
    });
  }

  if (payload?.avatar_url !== undefined || payload?.avatarUrl !== undefined) {
    const avatarUrl = payload.avatarUrl ?? payload.avatar_url;
    if (avatarUrl) {
      await request("/api/profile/avatar", {
        method: "PUT",
        body: JSON.stringify({ avatarUrl }),
      });
    } else {
      await request("/api/profile/avatar", { method: "DELETE" });
    }
  }

  const personalKeys = ["fullName", "full_name", "display_name", "username", "headline", "bio", "country", "city", "timezone", "language", "primaryLanguage", "defaultCurrency"];
  const hasPersonal = personalKeys.some((k) => payload?.[k] !== undefined);
  if (hasPersonal) {
    const current = await request("/api/profile/personal-info");
    await request("/api/profile/personal-info", {
      method: "PUT",
      body: JSON.stringify(toPersonalInfoRequest(current, payload)),
    });
  }

  return me();
}

function logout(redirectUrl) {
  clearToken();
  if (redirectUrl) window.location.href = redirectUrl;
}

function redirectToLogin(returnTo) {
  const loginPath = "/login";
  const param = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  window.location.href = `${loginPath}${param}`;
}

async function changePassword({ oldPassword, newPassword }) {
  return request("/api/profile/security/password", {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

async function resetPasswordRequest() {
  throw new Error("La réinitialisation par e-mail n'est pas encore disponible. Connectez-vous puis changez le mot de passe dans Paramètres > Sécurité.");
}

async function resetPassword() {
  throw new Error("La réinitialisation par e-mail n'est pas encore disponible. Connectez-vous puis changez le mot de passe dans Paramètres > Sécurité.");
}

export const auth = {
  me,
  loginViaEmailPassword,
  register,
  updateMe,
  logout,
  redirectToLogin,
  changePassword,
  resetPasswordRequest,
  resetPassword,
  setToken,
};

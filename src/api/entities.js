import { request, uploadRequest, asArray, API_BASE_URL, isAbsent } from "./client";
import {
  normalizeProject,
  toProjectRequest,
  normalizeProposal,
  toProposalRequest,
  normalizeContract,
  normalizePayment,
  normalizeConversation,
  normalizeMessage,
  normalizeFreelancerProfile,
  toFreelanceProfileRequest,
  normalizeClientProfile,
  toClientProfileRequest,
  normalizeCompany,
  toCompanyRequest,
  normalizeNotification,
} from "./normalize";

async function safeGet(path) {
  try {
    return await request(path);
  } catch (err) {
    if (isAbsent(err)) return null;
    throw err;
  }
}

export const entities = {
  User: {
    list: async () => asArray(await request("/api/admin/users")).map((u) => ({
      ...u,
      full_name: u.fullName || u.full_name,
      created_date: u.memberSince || u.createdAt,
      role: (u.roles || []).some((r) => String(r).toUpperCase() === "ADMIN") ? "admin" : "user",
    })),
    get: (id) => request(`/api/admin/users/${id}`),
  },

  Project: {
    list: async () => asArray(await request("/api/projects")).map(normalizeProject),
    filter: async (filterObj = {}) => {
      const params = new URLSearchParams();
      if (filterObj.query || filterObj.q) params.set("query", filterObj.query || filterObj.q);
      if (filterObj.category) params.set("category", filterObj.category);
      if (filterObj.country) params.set("country", filterObj.country);
      params.set("size", String(filterObj.size || filterObj.limit || 50));
      params.set("page", String(filterObj.page || 0));
      if (filterObj.created_by_id || filterObj.client_id || filterObj.mine) {
        return (asArray(await request("/api/projects/me"))).map(normalizeProject);
      }
      const data = await request(`/api/projects?${params.toString()}`);
      let list = asArray(data).map(normalizeProject);
      const status = String(filterObj.status || "").toLowerCase();
      if (status && status !== "published" && status !== "open") {
        list = list.filter((p) => String(p.status || "").toLowerCase() === status);
      }
      return list;
    },
    get: async (id) => normalizeProject(await request(`/api/projects/${id}`)),
    create: async (data) => normalizeProject(await request("/api/projects", {
      method: "POST",
      body: JSON.stringify(toProjectRequest(data)),
    })),
    update: async (id, data) => normalizeProject(await request(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(toProjectRequest(data)),
    })),
    remove: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),
    me: async () => (asArray(await request("/api/projects/me"))).map(normalizeProject),
  },

  Proposal: {
    list: async () => (asArray(await request("/api/proposals/me"))).map(normalizeProposal),
    filter: async (filterObj = {}) => {
      if (filterObj.project_id || filterObj.projectId) {
        const projectId = filterObj.project_id || filterObj.projectId;
        let list = (asArray(await request(`/api/projects/${projectId}/proposals`))).map(normalizeProposal);
        if (filterObj.status) list = list.filter((p) => String(p.status).toLowerCase() === String(filterObj.status).toLowerCase());
        return list;
      }
      let list = (asArray(await request("/api/proposals/me"))).map(normalizeProposal);
      if (filterObj.status) list = list.filter((p) => String(p.status).toLowerCase() === String(filterObj.status).toLowerCase());
      return list;
    },
    get: async (id) => normalizeProposal(await request(`/api/proposals/${id}`)),
    create: async (data) => {
      const projectId = data.project_id || data.projectId;
      return normalizeProposal(await request(`/api/projects/${projectId}/proposals`, {
        method: "POST",
        body: JSON.stringify(toProposalRequest(data)),
      }));
    },
    update: async (id, data) => {
      if (data.status) {
        return normalizeProposal(await request(`/api/proposals/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: String(data.status).toUpperCase() }),
        }));
      }
      return normalizeProposal(await request(`/api/proposals/${id}`));
    },
    remove: (id) => request(`/api/proposals/${id}`, { method: "DELETE" }),
  },

  Contract: {
    list: async () => (asArray(await request("/api/contracts/me"))).map(normalizeContract),
    filter: async (filterObj = {}) => {
      let list = (asArray(await request("/api/contracts/me"))).map(normalizeContract);
      if (filterObj.client_id) list = list.filter((c) => String(c.client_id) === String(filterObj.client_id));
      if (filterObj.freelancer_id) list = list.filter((c) => String(c.freelancer_id) === String(filterObj.freelancer_id));
      return list;
    },
    get: async (id) => normalizeContract(await request(`/api/contracts/${id}`)),
    create: async () => {
      throw new Error("Le contrat est créé automatiquement à l'acceptation d'une candidature.");
    },
    update: async (id, data) => {
      if (data.status) {
        return normalizeContract(await request(`/api/contracts/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: String(data.status).toUpperCase() }),
        }));
      }
      return normalizeContract(await request(`/api/contracts/${id}`));
    },
  },

  FreelancerProfile: {
    list: async (sort, limit) => {
      const params = new URLSearchParams({ limit: String(limit || 50) });
      return (asArray(await request(`/api/public/freelancers?${params}`))).map(normalizeFreelancerProfile);
    },
    filter: async (filterObj = {}, sort, limit) => {
      if (filterObj.user_id || filterObj.created_by_id) {
        const mine = await safeGet("/api/profile/freelance");
        return mine ? [normalizeFreelancerProfile(mine)] : [];
      }
      const params = new URLSearchParams();
      if (filterObj.query || filterObj.q) params.set("query", filterObj.query || filterObj.q);
      if (filterObj.country) params.set("country", filterObj.country);
      params.set("limit", String(limit || 50));
      return (asArray(await request(`/api/public/freelancers?${params}`))).map(normalizeFreelancerProfile);
    },
    get: async (id) => {
      const rec = await safeGet(`/api/public/freelancers/${encodeURIComponent(id)}`);
      return rec ? normalizeFreelancerProfile(rec) : null;
    },
    create: async (data) => normalizeFreelancerProfile(await request("/api/profile/freelance", {
      method: "POST",
      body: JSON.stringify(toFreelanceProfileRequest(data)),
    })),
    update: async (_id, data) => normalizeFreelancerProfile(await request("/api/profile/freelance", {
      method: "POST",
      body: JSON.stringify(toFreelanceProfileRequest(data)),
    })),
    me: async () => {
      const rec = await safeGet("/api/profile/freelance");
      return rec ? normalizeFreelancerProfile(rec) : null;
    },
  },

  ClientProfile: {
    list: async () => {
      const rec = await safeGet("/api/profile/client");
      return rec ? [normalizeClientProfile(rec)] : [];
    },
    filter: async () => {
      const rec = await safeGet("/api/profile/client");
      return rec ? [normalizeClientProfile(rec)] : [];
    },
    get: async () => {
      const rec = await safeGet("/api/profile/client");
      return rec ? normalizeClientProfile(rec) : null;
    },
    create: async (data) => normalizeClientProfile(await request("/api/profile/client", {
      method: "POST",
      body: JSON.stringify(toClientProfileRequest(data)),
    })),
    update: async (_id, data) => normalizeClientProfile(await request("/api/profile/client", {
      method: "POST",
      body: JSON.stringify(toClientProfileRequest(data)),
    })),
  },

  Company: {
    list: async () => {
      const rec = await safeGet("/api/profile/company");
      return rec ? [normalizeCompany(rec)] : [];
    },
    filter: async () => {
      const rec = await safeGet("/api/profile/company");
      return rec ? [normalizeCompany(rec)] : [];
    },
    get: async () => {
      const rec = await safeGet("/api/profile/company");
      return rec ? normalizeCompany(rec) : null;
    },
    create: async (data) => normalizeCompany(await request("/api/profile/company", {
      method: "POST",
      body: JSON.stringify(toCompanyRequest(data)),
    })),
    update: async (id, data) => normalizeCompany(await request(`/api/profile/company/${id}`, {
      method: "PUT",
      body: JSON.stringify(toCompanyRequest(data)),
    })),
  },

  Conversation: {
    list: async () => (asArray(await request("/api/conversations"))).map(normalizeConversation),
    filter: async () => (asArray(await request("/api/conversations"))).map(normalizeConversation),
    get: async (id) => {
      const list = (asArray(await request("/api/conversations"))).map(normalizeConversation);
      return list.find((c) => String(c.id) === String(id)) || null;
    },
    create: async (data) => normalizeConversation(await request("/api/conversations", {
      method: "POST",
      body: JSON.stringify({
        targetUserId: data.targetUserId || data.participant_b_id || data.other,
        projectId: data.projectId || data.project_id || null,
      }),
    })),
    update: async () => null,
  },

  Message: {
    filter: async (filterObj = {}) => {
      const convId = filterObj.conversation_id || filterObj.conversationId;
      return (asArray(await request(`/api/conversations/${convId}/messages`))).map(normalizeMessage);
    },
    create: async (data) => {
      const convId = data.conversation_id || data.conversationId;
      const attachmentUrl = Array.isArray(data.attachments) && data.attachments[0]
        ? (data.attachments[0].url || data.attachments[0])
        : data.attachmentUrl;
      return normalizeMessage(await request(`/api/conversations/${convId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: data.content || data.body || data.text || "",
          attachmentUrl,
        }),
      }));
    },
  },

  WalletTransaction: {
    list: async () => (asArray(await request("/api/payments/me"))).map(normalizePayment),
    filter: async (filterObj = {}) => {
      let list = (asArray(await request("/api/payments/me"))).map(normalizePayment);
      if (filterObj.type) list = list.filter((t) => t.type === filterObj.type);
      return list;
    },
    create: async (data) => {
      if (data.contractId || data.contract_id) {
        return normalizePayment(await request("/api/payments/escrow/initiate", {
          method: "POST",
          body: JSON.stringify({
            contractId: data.contractId || data.contract_id,
            providerName: data.providerName || (data.method === "Orange Money" ? "ORANGE_MONEY" : "WAVE"),
            customerPhone: data.customerPhone || data.phone,
            successUrl: data.successUrl || `${window.location.origin}/wallet`,
            errorUrl: data.errorUrl || `${window.location.origin}/wallet`,
          }),
        }));
      }
      throw new Error("Les dépôts se font via un contrat (Wave ou Orange Money).");
    },
  },

  Notification: {
    list: async () => (asArray(await request("/api/notifications"))).map(normalizeNotification),
    markRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request("/api/notifications/read-all", { method: "PATCH" }),
    unreadCount: async () => {
      const data = await request("/api/notifications/unread-count");
      return data?.unreadCount ?? 0;
    },
  },

  Category: {
    list: async () => asArray(await request("/api/categories/active")),
  },

  NotificationPreferences: {
    get: () => request("/api/profile/notifications"),
    update: (data) => request("/api/profile/notifications", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  },

  Security: {
    info: () => request("/api/profile/security"),
  },

  Admin: {
    stats: () => request("/api/admin/stats"),
    users: (params = {}) => {
      const q = new URLSearchParams();
      if (params.search) q.set("search", params.search);
      if (params.role) q.set("role", params.role);
      if (params.status) q.set("status", params.status);
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/users${suffix}`);
    },
    projects: (params = {}) => {
      const q = new URLSearchParams();
      if (params.status) q.set("status", params.status);
      if (params.category) q.set("category", params.category);
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/projects${suffix}`);
    },
    transactions: (params = {}) => {
      const q = new URLSearchParams();
      if (params.status) q.set("status", params.status);
      if (params.type) q.set("type", params.type);
      const suffix = q.toString() ? `?${q}` : "";
      return request(`/api/admin/transactions${suffix}`);
    },
  },

  Dashboard: {
    me: () => request("/api/dashboard"),
    freelance: () => request("/api/dashboard/freelance"),
    client: () => request("/api/dashboard/client"),
  },
};

export const integrations = {
  Core: {
    UploadFile: async ({ file, contractId, projectId, accessType }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (accessType) formData.append("accessType", accessType);
      if (contractId) formData.append("contractId", contractId);
      if (projectId) formData.append("projectId", projectId);
      const result = await uploadRequest("/api/files/upload", formData);
      const fileUrl = result?.id ? `${API_BASE_URL}/api/files/${result.id}/download` : (result?.url || result?.fileUrl);
      return { file_url: fileUrl, ...result };
    },
  },
};

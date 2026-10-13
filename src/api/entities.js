import { request, uploadRequest, buildQuery } from "./client";

function createEntityEndpoint(entityPath) {
  return {
    list: (sort, limit) =>
      request(`/${entityPath}?${buildQuery(null, sort, limit)}`),

    filter: (filterObj, sort, limit) =>
      request(`/${entityPath}?${buildQuery(filterObj, sort, limit)}`),

    get: (id) => request(`/${entityPath}/${id}`),

    create: (data) =>
      request(`/${entityPath}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(`/${entityPath}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    remove: (id) =>
      request(`/${entityPath}/${id}`, {
        method: "DELETE",
      }),
  };
}

export const entities = {
  User: createEntityEndpoint("users"),
  FreelancerProfile: createEntityEndpoint("freelancer-profiles"),
  ClientProfile: createEntityEndpoint("client-profiles"),
  Company: createEntityEndpoint("companies"),
  Project: createEntityEndpoint("projects"),
  Proposal: createEntityEndpoint("proposals"),
  Contract: createEntityEndpoint("contracts"),
  Conversation: createEntityEndpoint("conversations"),
  Message: createEntityEndpoint("messages"),
  WalletTransaction: createEntityEndpoint("wallet-transactions"),
};

export const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadRequest("/uploads", formData);
      return { file_url: result.url || result.fileUrl || result.location };
    },
  },
};

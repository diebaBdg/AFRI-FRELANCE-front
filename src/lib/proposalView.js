import { api } from "@/api/apiClient";

export async function fetchProposals(projectId) {
  try {
    const list = await api.entities.Proposal.filter({ project_id: projectId }, "-created_date", 100);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
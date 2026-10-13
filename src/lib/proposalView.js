import { base44 } from "@/api/base44Client";

export async function fetchProposals(projectId) {
  try {
    const list = await base44.entities.Proposal.filter({ project_id: projectId }, "-created_date", 100);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
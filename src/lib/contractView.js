import { api } from "@/api/apiClient";

const STATUS_LABEL = {
  active: "Active",
  paused: "Pending",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

export const toContractView = (rec) => ({
  id: rec.id,
  _real: true,
  projectId: rec.project_id,
  title: rec.project_title || "",
  freelancerId: rec.freelancer_id,
  freelancerName: rec.freelancer_name,
  clientName: rec.client_name,
  amount: rec.price ?? 0,
  type: "Sur devis",
  status: STATUS_LABEL[rec.status] || "Active",
  startDate: rec.created_date ? new Date(rec.created_date).toLocaleDateString("fr-FR") : "",
  endDate: rec.delay_days ? `+${rec.delay_days} j` : "",
});

export async function fetchContractsForUser(userId) {
  if (!userId) return [];
  try {
    const [asClient, asFreelancer] = await Promise.all([
      api.entities.Contract.filter({ client_id: userId }, "-created_date", 100).catch(() => []),
      api.entities.Contract.filter({ freelancer_id: userId }, "-created_date", 100).catch(() => []),
    ]);
    const seen = new Set();
    const out = [];
    for (const r of [...(asClient || []), ...(asFreelancer || [])]) {
      if (!seen.has(r.id)) { seen.add(r.id); out.push(toContractView(r)); }
    }
    return out;
  } catch {
    return [];
  }
}
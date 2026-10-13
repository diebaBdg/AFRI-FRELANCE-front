import { base44 } from "@/api/base44Client";

const FLAGS = {
  Sénégal: "🇸🇳",
  Senegal: "🇸🇳",
  "Côte d'Ivoire": "🇨🇮",
  "Cote d'Ivoire": "🇨🇮",
  France: "🇫🇷",
  Cameroun: "🇨🇲",
  Mali: "🇲🇱",
  Nigeria: "🇳🇬",
  Maroc: "🇲🇦",
};
export const flagFor = (c) => (c && FLAGS[c]) || "🌍";

// Map a Project entity record to the same shape the UI (ProjectCard / ProjectDetail)
// already expects from the mock data, so real records render with zero card changes.
export const toProjectView = (rec) => ({
  id: rec.id,
  _real: true,
  owner_id: rec.created_by_id,
  title: rec.title || "Sans titre",
  description: rec.description || "",
  category: rec.category || "",
  skills: Array.isArray(rec.skills) ? rec.skills : [],
  budgetMin: rec.budget_min ?? 0,
  budgetMax: rec.budget_max ?? 0,
  budgetType: rec.budget_type || "fixed",
  deadline: rec.deadline || "",
  status: rec.status || "published",
  proposals: 0,
  postedDate: rec.created_date ? new Date(rec.created_date).toLocaleDateString("fr-FR") : "",
  clientName: rec.client_name || "Client AfriFreelance",
  clientRating: 0,
  location: { city: rec.city || "", flag: flagFor(rec.country) },
  objectives: rec.objectives || "",
  deliverables: rec.deliverables || "",
  contractType: rec.contract_type || "Sur devis",
  experienceLevel: rec.experience_level || "Intermédiaire",
});

export async function fetchPublishedProjects() {
  try {
    const list = await base44.entities.Project.filter({ status: "published" }, "-created_date", 50);
    return (Array.isArray(list) ? list : []).map(toProjectView);
  } catch {
    return [];
  }
}

export async function fetchProject(id) {
  try {
    const rec = await base44.entities.Project.get(id);
    return rec ? toProjectView(rec) : null;
  } catch {
    return null;
  }
}
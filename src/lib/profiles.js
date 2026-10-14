import { api } from "@/api/apiClient";

export const COUNTRIES = ["Sénégal", "Côte d'Ivoire", "Cameroun", "Bénin", "Maroc", "Nigeria", "France", "Belgique", "Canada", "Tunisie", "Algérie", "Burkina Faso", "Mali", "Guinée", "Togo", "Ghana", "Kenya", "Afrique du Sud", "Royaume-Uni", "États-Unis"];
export const LANGUAGES = ["Français", "Anglais", "Wolof", "Arabe", "Espagnol", "Allemand", "Portugais", "Mandarin", "Coréen", "Swahili", "Yoruba", "Bambara", "Haoussa", "Peul"];
export const TIMEZONES = ["Atlantic/Reykjavik", "Africa/Dakar", "Africa/Abidjan", "Africa/Casablanca", "Africa/Lagos", "Europe/Paris", "Europe/Brussels", "America/Toronto", "Africa/Nairobi"];

export const SKILL_SUGGESTIONS = ["Java", "Spring Boot", "React", "Node.js", "TypeScript", "Python", "Django", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Figma", "UI/UX", "React Native", "Flutter", "Swift", "Kotlin", "PHP", "Laravel", "Vue.js", "GraphQL", "Tailwind CSS", "Next.js", "Angular", "Go", "Rust", "C++", "TensorFlow", "Data Science", "SEO", "Cybersécurité", "DevOps", "WordPress", "Stripe", "Spring Security", "Microservices", "REST API"];

export const SKILL_LEVELS = [{ value: "beginner", label: "Débutant" }, { value: "intermediate", label: "Intermédiaire" }, { value: "advanced", label: "Avancé" }, { value: "expert", label: "Expert" }];
export const LANG_LEVELS = [{ value: "beginner", label: "Débutant" }, { value: "elementary", label: "Élémentaire" }, { value: "intermediate", label: "Intermédiaire" }, { value: "advanced", label: "Avancé" }, { value: "fluent", label: "Courant" }, { value: "native", label: "Natif" }];
export const CURRENCIES = [{ value: "USD", label: "USD $" }, { value: "EUR", label: "EUR €" }, { value: "XOF", label: "XOF FCFA" }, { value: "GBP", label: "GBP £" }];
export const AVAILABILITY_STATUS = [{ value: "available_now", label: "Disponible maintenant", dot: "bg-brand" }, { value: "available_soon", label: "Disponible prochainement", dot: "bg-amber-400" }, { value: "unavailable", label: "Indisponible", dot: "bg-rose-400" }];
export const COMMITMENTS = [{ value: "full_time", label: "Temps plein" }, { value: "part_time", label: "Temps partiel" }, { value: "per_project", label: "Par mission" }];
export const WORK_TYPES = ["Remote", "Hybride", "Sur site"];
export const PROJECT_TYPES = ["Court terme", "Long terme", "Freelance", "Consulting", "Temps partiel", "Temps plein"];
export const COMPANY_SIZES = [{ value: "solo", label: "Indépendant / Solo" }, { value: "small", label: "2–10 employés" }, { value: "medium", label: "11–50 employés" }, { value: "large", label: "51–250 employés" }, { value: "enterprise", label: "250+ employés" }];
export const COMPANY_ROLES = [{ value: "owner", label: "Owner" }, { value: "admin", label: "Admin" }, { value: "recruiter", label: "Recruteur" }, { value: "member", label: "Membre" }];

export const arr = (x) => (Array.isArray(x) ? x : []);
export const skillName = (s) => (s && typeof s === "object" ? s.name : s);

export async function getMyProfiles(userId) {
  if (!userId) return { freelancer: null, client: null };
  const [f, c] = await Promise.all([
    api.entities.FreelancerProfile.filter({ user_id: userId }).catch(() => []),
    api.entities.ClientProfile.filter({ user_id: userId }).catch(() => []),
  ]);
  return { freelancer: (Array.isArray(f) ? f : [])[0] || null, client: (Array.isArray(c) ? c : [])[0] || null };
}

export async function getMyCompany(userId) {
  if (!userId) return null;
  const list = await api.entities.Company.filter({ owner_id: userId }).catch(() => []);
  return (Array.isArray(list) ? list : [])[0] || null;
}

const emptyFreelancer = {
  headline: "", bio: "", country: "", city: "", skills: [], languages: [],
  hourly_rate: null, daily_rate: null, min_project_rate: null, currency: "USD",
  availability_status: "available_now", availability_commitment: "per_project", hours_per_week: null,
  experience: [], education: [], certifications: [], portfolio: [],
  links: {}, preferences: { work_types: [], project_types: [], countries: [], timezone: "Atlantic/Reykjavik" },
  verification: { email: true, phone: false, identity: false, professional: false },
  verified: false, active: true, user_id: "",
};

export async function ensureFreelancerProfile(user, avatar_url) {
  const { freelancer } = await getMyProfiles(user.id);
  if (freelancer) return freelancer;
  return await api.entities.FreelancerProfile.create({ ...emptyFreelancer, user_id: user.id, avatar_url: avatar_url || "" });
}

export async function ensureClientProfile(user) {
  const { client } = await getMyProfiles(user.id);
  if (client) return client;
  return await api.entities.ClientProfile.create({
    user_id: user.id, display_name: user.full_name || (user.email ? user.email.split("@")[0] : "Mon profil"),
    kind: "individual", active: true,
  });
}

export function computeCompletion(p) {
  if (!p) return 0;
  const checks = [
    !!p.avatar_url, !!p.headline, !!p.bio && p.bio.length >= 60,
    arr(p.skills).length >= 3, arr(p.experience).length >= 1, arr(p.education).length >= 1,
    arr(p.languages).length >= 1, arr(p.portfolio).length >= 1, p.hourly_rate != null,
    arr(p.certifications).length >= 1, !!(p.verification && (p.verification.identity || p.verification.phone)), !!p.availability_status,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function completionChecks(p) {
  if (!p) return [];
  return [
    { label: "Photo", done: !!p.avatar_url },
    { label: "Titre", done: !!p.headline },
    { label: "Bio (60+ caractères)", done: !!p.bio && p.bio.length >= 60 },
    { label: "Compétences (3+)", done: arr(p.skills).length >= 3 },
    { label: "Expérience", done: arr(p.experience).length >= 1 },
    { label: "Formation", done: arr(p.education).length >= 1 },
    { label: "Langues", done: arr(p.languages).length >= 1 },
    { label: "Portfolio", done: arr(p.portfolio).length >= 1 },
    { label: "Tarif", done: p.hourly_rate != null },
    { label: "Certification", done: arr(p.certifications).length >= 1 },
    { label: "Vérification", done: !!(p.verification && (p.verification.identity || p.verification.phone)) },
    { label: "Disponibilité", done: !!p.availability_status },
  ];
}

export function parseUsername(v) {
  return (v || "").trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

export function validateUrl(v) {
  if (!v) return null;
  try { new URL(v); return null; } catch { return "URL invalide"; }
}
export function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Email invalide";
}

export const money = (amount, currency = "USD") => {
  const sym = { USD: "$", EUR: "€", GBP: "£", XOF: "FCFA" }[currency] || "";
  const n = Number(amount || 0);
  return `${currency === "XOF" ? n.toLocaleString("fr-FR") : n.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} ${sym}`.trim();
};
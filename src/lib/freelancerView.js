import { base44 } from "@/api/base44Client";
import { flagFor } from "@/lib/mockData";

const LEVEL_NUM = { beginner: 2, intermediate: 3, advanced: 4, expert: 5 };

const period = (e) => (e?.start || e?.end ? `${e.start || ""}${e.start && e.end ? " — " : ""}${e.current ? "Présent" : e.end || ""}` : "");

export const toFreelancerView = (rec) => ({
  id: rec.id,
  _real: true,
  userId: rec.user_id,
  name: rec.full_name || "Freelance",
  title: rec.headline || "",
  avatar: rec.avatar_url,
  country: rec.country || "",
  city: rec.city || "",
  flag: flagFor(rec.country),
  category: rec.category || "",
  skills: (rec.skills || []).map((s) => (s && typeof s === "object" ? s.name : s)),
  skillLevels: (rec.skills || []).reduce((acc, s) => {
    if (s && typeof s === "object" && s.name) acc[s.name] = LEVEL_NUM[s.level] || 3;
    return acc;
  }, {}),
  rate: rec.hourly_rate || 0,
  currency: rec.currency || "USD",
  rating: rec.rating || 0,
  reviews: rec.reviews || 0,
  available: rec.availability_status === "available_now",
  availability_status: rec.availability_status,
  verification: rec.verification || {},
  verified: {
    identity: !!rec.verification?.identity,
    phone: !!rec.verification?.phone,
    email: !!rec.verification?.email,
    pro: !!(rec.verified || rec.verification?.professional),
  },
  topFreelancer: !!rec.top_freelancer,
  experienceYears: rec.experience_years || 0,
  languages: (rec.languages || []).map((l) => (l && typeof l === "object" ? l.name : l)),
  bio: rec.bio || "",
  experience: (rec.experience || []).map((e) => ({
    role: e.title || "",
    company: e.company || "",
    period: period(e),
    desc: e.description || "",
  })),
  education: rec.education || [],
  certifications: rec.certifications || [],
  portfolio: (rec.portfolio || []).map((p) => ({
    title: p.title || "",
    image: p.image || "",
    description: p.description || "",
    technologies: p.technologies || [],
    url: p.url || "",
    date: p.date || "",
    role: p.role || "",
  })),
  links: rec.links || {},
  responseTime: rec.response_time || "",
});

export async function fetchFreelancers(opts = {}) {
  try {
    const list = await base44.entities.FreelancerProfile.filter(
      opts.filter || {},
      opts.sort || "-updated_date",
      opts.limit || 50
    );
    return (Array.isArray(list) ? list : [])
      .filter((r) => r.active !== false)
      .map(toFreelancerView);
  } catch {
    return [];
  }
}

export async function fetchFreelancer(id) {
  try {
    const rec = await base44.entities.FreelancerProfile.get(id);
    return rec ? toFreelancerView(rec) : null;
  } catch {
    return null;
  }
}

export const matchFreelancersToProject = (project, freelancers) => {
  const skills = (project?.skills || []).map((s) => String(s).toLowerCase());
  return (freelancers || [])
    .map((f) => {
      let score = 0;
      const fSkills = (f.skills || []).map((s) => String(s).toLowerCase());
      const common = fSkills.filter((s) => skills.includes(s));
      score += common.length * 18;
      if (f.available) score += 10;
      if (f.category && f.category === project.category) score += 15;
      if (f.rating) score += Math.round((f.rating - 4) * 10);
      score = Math.min(99, Math.max(0, score));
      return {
        freelancer: f,
        score,
        reasons: common
          .concat(f.available ? ["Disponible"] : [])
          .concat(f.experienceYears ? [`${f.experienceYears} ans d'expérience`] : []),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};
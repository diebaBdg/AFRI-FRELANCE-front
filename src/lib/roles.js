export const ACCOUNT_TYPES = [
  "ROLE_CLIENT",
  "ROLE_FREELANCER",
  "ROLE_VERIFIED_FREELANCER",
  "ROLE_ADMIN",
  "ROLE_MODERATOR",
  "ROLE_SUPPORT",
];

// Roles a user can self-select at signup / in profile
export const SIGNUP_TYPES = ["ROLE_CLIENT", "ROLE_FREELANCER"];

export const ROLE_META = {
  ROLE_CLIENT: { label: "Client", desc: "Publie des projets, recrute des freelances, paie.", accent: "brand" },
  ROLE_FREELANCER: { label: "Freelance", desc: "Propose ses services, répond aux projets, livre.", accent: "gold" },
  ROLE_VERIFIED_FREELANCER: { label: "Freelance vérifié", desc: "Freelance vérifié identité/compétences (badge, priorité matching).", accent: "gold" },
  ROLE_ADMIN: { label: "Administrateur", desc: "Gestion globale de la plateforme.", accent: "ink" },
  ROLE_MODERATOR: { label: "Modérateur", desc: "Modération du contenu, litiges de premier niveau.", accent: "ink" },
  ROLE_SUPPORT: { label: "Support", desc: "Support client, accès lecture aux tickets/comptes.", accent: "ink" },
};

export const roleLabel = (t) => ROLE_META[t]?.label || (t || "—");
export const roleDesc = (t) => ROLE_META[t]?.desc || "";
export const isStaff = (t) => ["ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_SUPPORT"].includes(t);
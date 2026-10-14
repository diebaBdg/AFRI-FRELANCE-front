import { api } from "@/api/apiClient";
import { CATEGORIES as FALLBACK } from "@/lib/mockData";

export function toCategoryOption(c) {
  if (!c) return null;
  if (typeof c === "string") return { id: c, name: c };
  const name = c.name || c.libelle || "";
  if (!name) return null;
  return {
    id: name,
    name,
    icon: c.iconName || c.icon || "Briefcase",
  };
}

export async function fetchCategories() {
  try {
    const list = await api.entities.Category.list();
    const mapped = (Array.isArray(list) ? list : []).map(toCategoryOption).filter(Boolean);
    return mapped.length ? mapped : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

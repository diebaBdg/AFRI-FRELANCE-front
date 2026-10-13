import { ShieldCheck, Phone, Mail, BadgeCheck, Star } from "lucide-react";

export function VerifiedBadge({ type, label }) {
  const map = {
    identity: { icon: ShieldCheck, label: "Identité vérifiée" },
    phone: { icon: Phone, label: "Téléphone vérifié" },
    email: { icon: Mail, label: "Email vérifié" },
    pro: { icon: BadgeCheck, label: "Professionnel vérifié" },
  };
  const M = map[type] || { icon: ShieldCheck, label };
  const Icon = M.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
      <Icon className="h-3 w-3" /> {M.label}
    </span>
  );
}

export function TopFreelancerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Top Freelancer
    </span>
  );
}
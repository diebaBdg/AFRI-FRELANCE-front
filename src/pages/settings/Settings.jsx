import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/roles";
import { ShieldCheck, User, Briefcase, Building2, Lock, Bell, Sliders, FolderKanban, FileText, Wallet as WalletIcon, MessageSquare, Star } from "lucide-react";
import { computeCompletion } from "@/lib/profiles";

const accountNav = [
  { label: "Profil", to: "/settings/profile", icon: User },
  { label: "Profils professionnels", to: "/settings/professional", icon: Briefcase },
  { label: "Sécurité", to: "/settings/security", icon: Lock },
  { label: "Notifications", to: "/settings/notifications", icon: Bell },
  { label: "Préférences", to: "/settings/preferences", icon: Sliders },
];
const activityNav = [
  { label: "Mes contrats", to: "/contracts", icon: FileText },
  { label: "Mes messages", to: "/messages", icon: MessageSquare },
  { label: "Mes paiements", to: "/wallet", icon: WalletIcon },
  { label: "Mes projets", to: "/projects", icon: FolderKanban },
];
const companyNav = [
  { label: "Mon entreprise", to: "/settings/company", icon: Building2 },
];

function NavGroup({ title, items }) {
  return (
    <div>
      <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-0.5">
        {items.map((l) => (
          <NavLink key={l.to} to={l.to} end className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? "bg-brand-light text-brand font-medium" : "text-foreground/80 hover:bg-muted"}`}>
            <l.icon className="h-4 w-4" /> {l.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const initials = (user?.display_name || user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();
  const memberYear = user?.created_date ? new Date(user.created_date).getFullYear() : 2026;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Premium header */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-28 bg-gradient-to-r from-brand-ink to-brand/80" />
        <div className="px-5 pb-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="-mt-10 grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-brand-light text-brand shadow-lg sm:-mt-12 sm:h-24 sm:w-24">
                {user?.avatar_url ? <Image src={user.avatar_url} alt="" fittingType="fill" className="h-full w-full" /> : <span className="text-2xl font-bold">{initials}</span>}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-brand-ink sm:text-2xl">{user?.display_name || user?.full_name || (user?.email ? user.email.split("@")[0] : "Mon compte")}</h1>
                  <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3 text-brand" /> {roleLabel(user?.account_type)}</Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  {user?.username && <span className="text-brand-ink">@{user.username.replace(/^@/, "")}</span>}
                  {user?.country && <span className="flex items-center gap-1">📍 {user.country}</span>}
                  <span>Membre depuis {memberYear}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/settings/profile" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"><User className="h-4 w-4" /> Modifier le profil</Link>
              <Link to="/settings/professional" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-brand/40">Profils</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <nav className="space-y-4 lg:space-y-6">
            <div className="space-y-4 lg:space-y-6">
              <NavGroup title="Mon compte" items={accountNav} />
              <NavGroup title="Mon activité" items={activityNav} />
              <NavGroup title="Entreprise" items={companyNav} />
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
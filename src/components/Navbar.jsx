import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bell, Search, ChevronDown, LayoutDashboard, Briefcase, FolderKanban, MessageSquare, FileText, Wallet, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import { roleLabel } from "@/lib/roles";
import { User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProfileMenu from "@/components/ProfileMenu";

const publicLinks = [
  { label: "Trouver un freelance", to: "/freelancers" },
  { label: "Trouver une mission", to: "/projects" },
  { label: "Catégories", to: "/freelancers#categories" },
  { label: "Comment ça marche", to: "/how-it-works" },
  { label: "Pour les entreprises", to: "/business" },
];

const dashLinks = [
  { label: "Dashboard", to: "/dashboard/freelancer", icon: LayoutDashboard },
  { label: "Projets", to: "/projects", icon: FolderKanban },
  { label: "Candidatures", to: "/dashboard/freelancer#proposals", icon: Briefcase },
  { label: "Messages", to: "/messages", icon: MessageSquare },
  { label: "Contrats", to: "/contracts", icon: FileText },
  { label: "Wallet", to: "/wallet", icon: Wallet },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="https://media.base44.com/images/public/6a8833277a67a9086f551c95/cbf3a21e4_AfriFreelance-logo-primaire-horizontal-clair.svg"
            alt="AfriFreelance"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "text-brand" : "text-foreground/70 hover:text-brand"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/freelancers")} className="hidden h-9 w-9 place-items-center rounded-full text-foreground/60 hover:bg-muted hover:text-foreground sm:grid" aria-label="Recherche">
            <Search className="h-4 w-4" />
          </button>
          <button onClick={() => navigate("/notifications")} className="relative hidden h-9 w-9 place-items-center rounded-full text-foreground/60 hover:bg-muted hover:text-foreground sm:grid" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />
          </button>

          <Button size="sm" className="hidden bg-brand hover:bg-brand-dark md:inline-flex" onClick={() => navigate("/post-project")}>
            Publier un projet
          </Button>

          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate("/login")}>
                Se connecter
              </Button>
              <Button size="sm" className="hidden bg-brand-ink hover:bg-brand-ink/90 sm:inline-flex" onClick={() => navigate("/register")}>
                S'inscrire
              </Button>
            </>
          )}

          {/* Mobile toggle */}
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          {user && (
            <Link to="/settings/profile" onClick={() => setOpen(false)} className="mb-2 flex items-center gap-3 rounded-xl bg-brand-light p-2">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white text-brand">
                {user.avatar_url ? <Image src={user.avatar_url} alt="" fittingType="fill" className="h-9 w-9" /> : <User className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-ink">{user.display_name || user.full_name || user.email}</p>
                <p className="text-xs text-brand">{roleLabel(user.account_type)}</p>
              </div>
            </Link>
          )}
          <div className="flex flex-col gap-1">
            {publicLinks.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="my-3 h-px bg-border" />
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Espaces</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {dashLinks.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted">
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            ))}
            <Link to="/dashboard/client" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted">
              <Users className="h-4 w-4" /> Client
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted">
                <Globe className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            {user ? (
              <>
                <Button className="flex-1 bg-brand hover:bg-brand-dark" onClick={() => { setOpen(false); navigate("/post-project"); }}>Publier un projet</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); navigate("/settings/profile"); }}>Mon profil</Button>
                <Button variant="outline" className="flex-1" onClick={async () => { setOpen(false); await base44.auth.logout("/login"); }}>Déconnexion</Button>
              </>
            ) : (
              <>
                <Button className="flex-1 bg-brand hover:bg-brand-dark" onClick={() => { setOpen(false); navigate("/login"); }}>Se connecter</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); navigate("/register"); }}>S'inscrire</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
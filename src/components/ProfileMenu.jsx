import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown, Wallet, ArrowDownToLine, ArrowUpFromLine, ReceiptText, PieChart,
  LayoutDashboard, FolderKanban, Briefcase, MessageSquare, FileText, Settings,
  User as UserIcon, Globe, LogOut, Users,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/api/apiClient";
import { Image } from "@/components/ui/image";
import { roleLabel } from "@/lib/roles";

export default function ProfileMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!user) return null;

  const go = (to) => { setOpen(false); navigate(to); };
  const handleLogout = async () => {
    setOpen(false);
    await api.auth.logout("/login");
  };
  const name = user.display_name || user.full_name || (user.email ? user.email.split("@")[0] : "Mon compte");

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-full border border-border bg-white py-1 pl-1 pr-2 hover:border-brand/40">
        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-brand-light text-brand">
          {user.avatar_url ? <Image src={user.avatar_url} alt="" fittingType="fill" className="h-7 w-7" /> : <span className="text-xs font-bold">{name.charAt(0).toUpperCase()}</span>}
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="text-xs font-semibold text-brand-ink">{name}</span>
          <span className="text-[10px] text-brand">{roleLabel(user.account_type)}</span>
        </span>
        <ChevronDown className="h-3 w-3 text-foreground/40" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-[80vh] w-64 overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 text-neutral-200 shadow-2xl scrollbar-thin">
          <button onClick={() => go("/settings/profile")} className="flex w-full items-center gap-2 border-b border-neutral-700/60 p-3 text-left hover:bg-neutral-800">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-neutral-700 text-white">
              {user.avatar_url ? <Image src={user.avatar_url} alt="" fittingType="fill" className="h-9 w-9" /> : <span className="text-sm font-bold">{name.charAt(0).toUpperCase()}</span>}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-neutral-400">{user.email}</p>
            </div>
          </button>

          <Header label="Finances" />
          <Item icon={<Wallet className="h-4 w-4" />} label="Portefeuille" onClick={() => go("/wallet")} />
          <Item icon={<ArrowDownToLine className="h-4 w-4" />} label="Approvisionner" onClick={() => go("/wallet")} />
          <Item icon={<ArrowUpFromLine className="h-4 w-4" />} label="Retirer des fonds" onClick={() => go("/wallet")} />
          <Item icon={<ReceiptText className="h-4 w-4" />} label="Historique des transactions" onClick={() => go("/wallet")} />
          <Item icon={<PieChart className="h-4 w-4" />} label="Tableau de bord financier" onClick={() => go("/wallet")} />

          <Divider />
          <Header label="Mon espace" />
          <Item icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" onClick={() => go("/dashboard/freelancer")} />
          <Item icon={<FolderKanban className="h-4 w-4" />} label="Projets" onClick={() => go("/projects")} />
          <Item icon={<Briefcase className="h-4 w-4" />} label="Candidatures" onClick={() => go("/dashboard/freelancer#proposals")} />
          <Item icon={<MessageSquare className="h-4 w-4" />} label="Messages" onClick={() => go("/messages")} />
          <Item icon={<FileText className="h-4 w-4" />} label="Contrats" onClick={() => go("/contracts")} />
          <Item icon={<Users className="h-4 w-4" />} label="Espace client" onClick={() => go("/dashboard/client")} />
          {isAdmin && <Item icon={<Globe className="h-4 w-4" />} label="Admin" onClick={() => go("/admin")} />}

          <Divider />
          <Item icon={<Settings className="h-4 w-4" />} label="Paramètres" onClick={() => go("/settings")} />
          <Item icon={<UserIcon className="h-4 w-4" />} label="Profil" onClick={() => go("/settings/profile")} />
          <Item icon={<LogOut className="h-4 w-4" />} label="Déconnexion" onClick={handleLogout} danger />
        </div>
      )}
    </div>
  );
}

function Header({ label }) {
  return <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>;
}
function Divider() {
  return <div className="my-1 h-px bg-neutral-700/60" />;
}
function Item({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-neutral-800 ${danger ? "text-red-400 hover:text-red-300" : "text-neutral-200"}`}>
      <span className="text-neutral-400">{icon}</span> {label}
    </button>
  );
}
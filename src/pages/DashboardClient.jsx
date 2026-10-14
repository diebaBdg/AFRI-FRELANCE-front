import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingDown, FolderKanban, FileText, Users, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import FreelancerCard from "@/components/FreelancerCard";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { formatMoney } from "@/lib/mockData";
import { getMyProfiles } from "@/lib/profiles";
import { fetchFreelancers } from "@/lib/freelancerView";

const MONTHS = ["Mar", "Avr", "Mai", "Juin", "Juil", "Août"];
function monthKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function DashboardClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProjects, setMyProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [spent, setSpent] = useState(0);
  const [spendByMonth, setSpendByMonth] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) { setLoading(false); return; }
      const [projects, prf, fls] = await Promise.all([
        api.entities.Project.filter({ created_by_id: user.id }, "-created_date", 50).catch(() => []),
        getMyProfiles(user.id),
        fetchFreelancers({ limit: 8 }),
      ]);
      const txns = await api.entities.WalletTransaction.filter({ user_id: user.id }, "-created_date", 200).catch(() => []);
      const spend = (txns || []).filter((t) => t.type === "withdraw" || t.type === "escrow_in").reduce((s, t) => s + Number(t.amount || 0), 0);
      const now = new Date();
      const buckets = {};
      for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets[monthKey(d)] = { month: MONTHS[((now.getMonth() - i) + 12) % 12] || "M", spend: 0 }; }
      for (const t of txns || []) { if (!t.created_date) continue; const k = monthKey(new Date(t.created_date)); if (buckets[k] && (t.type === "withdraw" || t.type === "escrow_in")) buckets[k].spend += Number(t.amount || 0); }

      // proposals on my projects
      let allProps = [];
      for (const p of projects || []) {
        const lp = await api.entities.Proposal.filter({ project_id: p.id }, "-created_date", 20).catch(() => []);
        allProps = allProps.concat((lp || []).map((x) => ({ ...x, projectTitle: p.title })));
      }
      if (!alive) return;
      setMyProjects(projects || []);
      setProposals(allProps);
      setSpent(spend);
      setSpendByMonth(Object.values(buckets));
      setFreelancers(fls || []);
      setProfile(prf.client || null);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user?.id]);

  if (loading) return <div className="grid place-items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const kpis = [
    { label: "Projets publiés", value: myProjects.length, icon: FolderKanban },
    { label: "Projets actifs", value: myProjects.filter((p) => p.status === "in_progress" || p.status === "published").length, icon: FileText },
    { label: "Candidatures reçues", value: proposals.length, icon: Users },
    { label: "Dépenses totales", value: formatMoney(spent), icon: TrendingDown, color: "text-brand" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-ink">Espace Client — {profile?.display_name || user?.full_name || (user?.email ? user.email.split("@")[0] : "")}</h1>
          <p className="text-muted-foreground">Gérez vos projets et vos talents.</p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark" onClick={() => (window.location.href = "/post-project")}>+ Publier un projet</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <k.icon className={`h-5 w-5 ${k.color || "text-muted-foreground"}`} />
            <p className="mt-2 font-display text-xl font-bold text-brand-ink">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold">Dépenses mensuelles</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByMonth}>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="spend" fill="#00853F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">Candidatures reçues</h3>
          {proposals.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucune candidature pour l'instant.</p> : (
            <div className="mt-4 space-y-3">
              {proposals.slice(0, 8).map((pr) => (
                <Link to={`/projects/${pr.project_id}`} key={pr.id} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-brand/40">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand">{(pr.freelancer_name || "?")[0]}</div>
                  <div className="flex-1"><p className="text-sm font-medium">{pr.freelancer_name}</p><p className="text-xs text-muted-foreground">{pr.projectTitle} · {pr.price != null ? formatMoney(pr.price) : "—"}</p></div>
                  <Badge variant={pr.status === "accepted" ? "default" : "secondary"}>{pr.status === "pending" ? "Nouvelle" : pr.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Mes projets publiés</h3>
          <Link to="/projects" className="text-sm text-brand hover:underline">Voir tout</Link>
        </div>
        {myProjects.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucun projet publié.</p> : (
          <div className="mt-4 space-y-3">
            {myProjects.map((p) => (
              <Link to={`/projects/${p.id}`} key={p.id} className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-brand/40">
                <div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{formatMoney(p.budget_min || 0)} – {formatMoney(p.budget_max || 0)}</p></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {freelancers.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-gold" /><h3 className="font-display text-xl font-bold text-brand-ink">Freelances recommandés</h3></div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {freelancers.slice(0, 4).map((f) => <FreelancerCard key={f.id} freelancer={f} />)}
          </div>
        </div>
      )}
    </div>
  );
}
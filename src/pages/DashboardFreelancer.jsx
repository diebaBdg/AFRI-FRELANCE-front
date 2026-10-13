import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Briefcase, FileText, Star, Clock, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import ProjectCard from "@/components/ProjectCard";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { formatMoney } from "@/lib/mockData";
import { getMyProfiles } from "@/lib/profiles";
import { fetchContractsForUser } from "@/lib/contractView";
import { fetchPublishedProjects } from "@/lib/projectView";

const MONTHS = ["Mar", "Avr", "Mai", "Juin", "Juil", "Août"];
function monthKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function DashboardFreelancer() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [txnByMonth, setTxnByMonth] = useState([]);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) { setLoading(false); return; }
      const [ctr, prf, projs] = await Promise.all([
        fetchContractsForUser(user.id),
        base44.entities.Proposal.filter({ created_by_id: user.id }, "-created_date", 50).catch(() => []),
        fetchPublishedProjects(),
        getMyProfiles(user.id),
      ]);
      const myContracts = (ctr || []).filter((c) => c.freelancerId === user.id);
      const txns = await base44.entities.WalletTransaction.filter({ user_id: user.id }, "-created_date", 200).catch(() => []);
      const earnTxns = (txns || []).filter((t) => t.type === "earning");
      const totalEarn = earnTxns.reduce((s, t) => s + Number(t.amount || 0), 0);

      // 6-month buckets
      const now = new Date();
      const buckets = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets[monthKey(d)] = { month: MONTHS[((now.getMonth() - i) + 12) % 12] || "M", revenue: 0 };
      }
      for (const t of earnTxns) {
        if (!t.created_date) continue;
        const k = monthKey(new Date(t.created_date));
        if (buckets[k]) buckets[k].revenue += Number(t.amount || 0);
      }
      if (!alive) return;
      setContracts(myContracts);
      setProposals(proposals || []);
      setEarnings(totalEarn);
      setTxnByMonth(Object.values(buckets));
      setProfile(prf.freelancer || null);
      setProjects(projs || []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user?.id]);

  if (loading) return <div className="grid place-items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const mySkills = (profile?.skills || []).map((s) => (s && typeof s === "object" ? s.name : s));
  const recommended = projects
    .map((p) => {
      const common = (p.skills || []).filter((s) => mySkills.map((x) => String(x).toLowerCase()).includes(String(s).toLowerCase()));
      return { p, score: common.length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  const kpis = [
    { label: "Revenus", value: formatMoney(earnings), icon: TrendingUp, color: "text-brand" },
    { label: "Missions actives", value: contracts.filter((c) => c.status === "Active").length, icon: Briefcase },
    { label: "Candidatures", value: proposals.length, icon: FileText },
    { label: "Missions terminées", value: contracts.filter((c) => c.status === "Completed").length, icon: Clock },
    { label: "Note moyenne", value: profile?.rating ? `${profile.rating} ★` : "—", icon: Star, color: "text-brand-gold" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-ink">Bonjour, {user?.full_name || (user?.email ? user.email.split("@")[0] : "")} 👋</h1>
          <p className="text-muted-foreground">Voici votre activité freelance.</p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark" onClick={() => (window.location.href = "/projects")}><Briefcase className="mr-2 h-4 w-4" /> Trouver une mission</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <k.icon className={`h-5 w-5 ${k.color || "text-muted-foreground"}`} />
            <p className="mt-2 font-display text-xl font-bold text-brand-ink">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h3 className="font-semibold">Évolution des revenus</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={txnByMonth}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00853F" stopOpacity={0.4} /><stop offset="100%" stopColor="#00853F" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="revenue" stroke="#00853F" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold">Mes missions</h3>
          {contracts.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucune mission pour le moment.</p> : (
            <Tabs defaultValue="active" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="active" className="flex-1">Actives</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">Terminées</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">En attente</TabsTrigger>
              </TabsList>
              {["Active", "Completed", "Pending"].map((st) => (
                <TabsContent key={st} value={st === "Active" ? "active" : st === "Completed" ? "completed" : "pending"} className="mt-4 space-y-3">
                  {contracts.filter((c) => c.status === st).map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div><p className="text-sm font-medium">{c.title || "Projet"}</p><p className="text-xs text-muted-foreground">{formatMoney(c.amount)}</p></div>
                      <Badge variant={st === "Active" ? "default" : st === "Completed" ? "secondary" : "secondary"}>{c.status}</Badge>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">Candidatures récentes</h3>
          {proposals.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucune candidature envoyée.</p> : (
            <div className="mt-4 space-y-3">
              {proposals.map((pr) => (
                <Link to={`/projects/${pr.project_id}`} key={pr.id} className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand/40">
                  <div><p className="text-sm font-medium">{pr.project_title || "Projet"}</p><p className="text-xs text-muted-foreground">{pr.price != null ? formatMoney(pr.price) : "—"} · {pr.delay_days || "—"}j</p></div>
                  <Badge variant={pr.status === "accepted" ? "default" : "secondary"}>{pr.status === "pending" ? "En attente" : pr.status === "accepted" ? "Acceptée" : pr.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {recommended.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-gold" /><h3 className="font-semibold">Projets qui correspondent à votre profil</h3></div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </Card>
      )}
    </div>
  );
}
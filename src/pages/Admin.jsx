import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, DollarSign, AlertTriangle, TrendingUp, ShieldCheck, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { base44 } from "@/api/base44Client";
import { formatMoney, COMMISSION_RATE } from "@/lib/mockData";
import { useAuth } from "@/lib/AuthContext";

const MONTHS = ["Mar", "Avr", "Mai", "Juin", "Juil", "Août"];
function monthKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function Admin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [txns, setTxns] = useState([]);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, fl, pr, ct, co, tx] = await Promise.all([
          base44.entities.User.list("-created_date", 200).catch(() => []),
          base44.entities.FreelancerProfile.list("-created_date", 200).catch(() => []),
          base44.entities.Project.list("-created_date", 200).catch(() => []),
          base44.entities.Contract.list("-created_date", 200).catch(() => []),
          base44.entities.Company.list("-created_date", 100).catch(() => []),
          base44.entities.WalletTransaction.list("-created_date", 200).catch(() => []),
        ]);
        // 6-month: new projects + revenue by month from contracts/wallet
        const now = new Date();
        const buckets = {};
        for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const k = monthKey(d); buckets[k] = { month: MONTHS[((now.getMonth() - i) + 12) % 12] || "M", users: 0, projects: 0, revenue: 0 }; }
        for (const p of pr || []) { if (!p.created_date) continue; const k = monthKey(new Date(p.created_date)); if (buckets[k]) buckets[k].projects += 1; }
        for (const u2 of u || []) { if (!u2.created_date) continue; const k = monthKey(new Date(u2.created_date)); if (buckets[k]) buckets[k].users += 1; }
        for (const t of tx || []) { if (!t.created_date) continue; const k = monthKey(new Date(t.created_date)); if (buckets[k] && t.type === "fee") buckets[k].revenue += Number(t.amount || 0); else if (buckets[k] && t.type === "earning") buckets[k].revenue += Number(t.amount || 0) * COMMISSION_RATE; }
        if (!alive) return;
        setUsers(u || []); setFreelancers(fl || []); setProjects(pr || []); setContracts(ct || []); setCompanies(co || []); setTxns(tx || []); setChart(Object.values(buckets));
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive"><ShieldCheck className="h-7 w-7" /></div>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-ink">Accès réservé</h1>
        <p className="mt-2 text-muted-foreground">Le module d'administration est réservé aux administrateurs de la plateforme.</p>
        <Button className="mt-6 bg-brand hover:bg-brand-dark" onClick={() => { window.location.href = "/"; }}>Retour à l'accueil</Button>
      </div>
    );
  }

  if (loading) return <div className="grid place-items-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>;

  const volume = txns.filter((t) => t.type === "earning").reduce((s, t) => s + Number(t.amount || 0), 0);
  const commissions = Math.round(volume * COMMISSION_RATE);
  const disputes = contracts.filter((c) => c.status === "disputed");
  const kpis = [
    { label: "Utilisateurs", value: (users.length).toLocaleString("fr-FR"), icon: Users },
    { label: "Freelances", value: (freelancers.length).toLocaleString("fr-FR"), icon: Users },
    { label: "Entreprises", value: (companies.length).toLocaleString("fr-FR"), icon: Briefcase },
    { label: "Projets", value: (projects.length).toLocaleString("fr-FR"), icon: FileText },
    { label: "Contrats", value: (contracts.length).toLocaleString("fr-FR"), icon: FileText },
    { label: "Volume financier", value: formatMoney(volume), icon: DollarSign },
    { label: "Commissions", value: formatMoney(commissions), icon: TrendingUp, color: "text-brand" },
    { label: "Litiges", value: disputes.length, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-brand" /><h1 className="font-display text-2xl font-bold text-brand-ink">Admin Dashboard</h1></div>
      <p className="text-muted-foreground">Vue d'ensemble de la plateforme (données réelles).</p>

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
          <h3 className="font-semibold">Nouveaux utilisateurs & projets</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="users" fill="#00853F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="projects" fill="#D4A437" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold">Revenu plateforme (commissions)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs><linearGradient id="adm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4A437" stopOpacity={0.4} /><stop offset="100%" stopColor="#D4A437" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="revenue" stroke="#D4A437" strokeWidth={2} fill="url(#adm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList><TabsTrigger value="users">Utilisateurs</TabsTrigger><TabsTrigger value="projects">Projets</TabsTrigger><TabsTrigger value="disputes">Litiges</TabsTrigger></TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand">{(u.full_name || u.email || "?")[0].toUpperCase()}</div>
                    <div><p className="text-sm font-medium">{u.full_name || u.email}</p><p className="text-xs text-muted-foreground">{u.email} · {u.role}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="p-8 text-center text-muted-foreground">Aucun utilisateur.</p>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.client_name || "—"} · {formatMoney(p.budget_min || 0)} – {formatMoney(p.budget_max || 0)}</p></div>
                  <Badge variant="secondary">{p.status}</Badge>
                </div>
              ))}
              {projects.length === 0 && <p className="p-8 text-center text-muted-foreground">Aucun projet.</p>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-4">
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {disputes.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-destructive" /><div><p className="text-sm font-medium">{c.project_title || "Projet"}</p><p className="text-xs text-muted-foreground">{formatMoney(c.price || 0)} · Litige ouvert</p></div></div>
                  <div className="flex gap-2"><Button size="sm" variant="outline">Résoudre</Button><Button size="sm" variant="destructive">Suspendre</Button></div>
                </div>
              ))}
              {disputes.length === 0 && <p className="p-8 text-center text-muted-foreground">Aucun litige.</p>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
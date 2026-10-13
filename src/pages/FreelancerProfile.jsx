import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle2, MessageSquare, FileText, Briefcase, Star, TrendingUp, Award, Globe, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Rating from "@/components/Rating";
import { Image } from "@/components/ui/image";
import { VerifiedBadge, TopFreelancerBadge } from "@/components/VerifiedBadges";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { fetchFreelancer } from "@/lib/freelancerView";
import { flagFor } from "@/lib/mockData";
import { money } from "@/lib/profiles";
import AuthGateModal from "@/components/AuthGateModal";

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projects: 0, completed: 0, revenue: 0, active: 0 });
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rec = await fetchFreelancer(id);
      if (!alive) return;
      setF(rec);
      setLoading(false);
      if (rec?.userId) {
        const [contracts, txns] = await Promise.all([
          base44.entities.Contract.filter({ freelancer_id: rec.userId }, "-created_date", 200).catch(() => []),
          base44.entities.WalletTransaction.filter({ user_id: rec.userId, type: "earning" }, "-created_date", 200).catch(() => []),
        ]);
        const cs = contracts || [];
        const revenue = (txns || []).reduce((s, t) => s + Number(t.amount || 0), 0);
        if (alive) setStats({ projects: cs.length, completed: cs.filter((c) => c.status === "completed").length, revenue, active: cs.filter((c) => c.status === "active").length });
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="grid place-items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!f) {
    return <div className="grid place-items-center py-32 text-center"><p className="text-muted-foreground">Profil introuvable.</p><Button className="mt-4" variant="outline" onClick={() => navigate("/freelancers")}>Retour</Button></div>;
  }

  const contact = async () => {
    if (!user) { setGateOpen(true); return; }
    const otherId = f.userId || `fl_${id}`;
    navigate(`/messages?to=${encodeURIComponent(otherId)}&name=${encodeURIComponent(f.name || "Freelance")}&project=`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Card className="overflow-hidden border-border/60">
        <div className="h-24 bg-gradient-to-r from-brand-ink via-brand-dark to-brand" />
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Image src={f.avatar} alt={f.name} fittingType="fill" className="h-24 w-24 rounded-2xl ring-4 ring-white -mt-12" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-brand-ink">{f.name}</h1>
                {f.topFreelancer && <TopFreelancerBadge />}
              </div>
              <p className="text-muted-foreground">{f.title}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {f.flag} {[f.city, f.country].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={contact}><MessageSquare className="mr-2 h-4 w-4" /> Contacter</Button>
              <Button className="bg-brand hover:bg-brand-dark" onClick={() => (user ? navigate("/post-project") : setGateOpen(true))}><Briefcase className="mr-2 h-4 w-4" /> Proposer une mission</Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {f.verified.identity && <VerifiedBadge type="identity" />}
            {f.verified.phone && <VerifiedBadge type="phone" />}
            {f.verified.email && <VerifiedBadge type="email" />}
            {f.verified.pro && <VerifiedBadge type="pro" />}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Tarif</p><p className="font-semibold">{money(f.rate || 0, f.currency || "USD")}/h</p></div>
            <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Disponibilité</p><p className={`font-semibold ${f.available ? "text-brand" : ""}`}>{f.available ? "Disponible" : "Occupé"}</p></div>
            <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Note</p><p className="font-semibold">{f.rating > 0 ? `${f.rating} ★ (${f.reviews})` : "—"}</p></div>
            <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Expérience</p><p className="font-semibold">{f.experienceYears || 0} ans</p></div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="about" className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
          <TabsTrigger value="experience">Expérience</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-4">
          <Card className="p-6">
            <p className="leading-relaxed text-foreground/80">{f.bio || "Aucune description pour le moment."}</p>
            {f.languages.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{f.languages.map((l, i) => <Badge key={i} variant="secondary"><Globe className="mr-1 h-3 w-3" /> {l}</Badge>)}</div>}
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card className="p-6 space-y-4">
            {f.skills.length === 0 ? <p className="text-sm text-muted-foreground">Aucune compétence renseignée.</p> : f.skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm"><span className="font-medium">{s}</span><span className="text-muted-foreground">{f.skillLevels[s] || 3}/5</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${((f.skillLevels[s] || 3) / 5) * 100}%` }} /></div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          <Card className="p-6">
            {f.experience.length === 0 ? <p className="text-sm text-muted-foreground">Aucune expérience renseignée.</p> : (
              <div className="relative space-y-6 border-l-2 border-border pl-6">
                {f.experience.map((e, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-brand ring-4 ring-background" />
                    <p className="font-semibold text-foreground">{e.role} {e.company && <>· <span className="text-brand">{e.company}</span></>}</p>
                    {e.period && <p className="text-xs text-muted-foreground">{e.period}</p>}
                    {e.desc && <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-4">
          {f.portfolio.length === 0 ? <Card className="p-6 text-sm text-muted-foreground">Aucun projet dans le portfolio.</Card> : (
            <div className="grid gap-4 sm:grid-cols-2">
              {f.portfolio.map((p, i) => (
                <Card key={i} className="overflow-hidden">
                  {p.image && <img src={p.image} alt={p.title} className="aspect-video w-full object-cover" />}
                  <div className="p-3"><p className="text-sm font-medium">{p.title}</p>{p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}</div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Projets réalisés", value: stats.projects, icon: Briefcase },
              { label: "Missions terminées", value: stats.completed, icon: CheckCircle2 },
              { label: "Revenus générés", value: money(stats.revenue, "USD"), icon: TrendingUp },
              { label: "Contrats actifs", value: stats.active, icon: FileText },
              { label: "Temps de réponse", value: f.responseTime || "—", icon: Clock },
              { label: "Taux de réussite", value: stats.projects ? `${Math.round((stats.completed / stats.projects) * 100)}%` : "—", icon: Award },
            ].map((s) => (
              <Card key={s.label} className="p-5">
                <s.icon className="h-5 w-5 text-brand" />
                <p className="mt-3 font-display text-2xl font-bold text-brand-ink">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AuthGateModal open={gateOpen} onOpenChange={setGateOpen} title="Créez votre compte gratuitement" message="Inscrivez-vous pour contacter ce freelance, lui proposer une mission et collaborer sans frontières." />
    </div>
  );
}
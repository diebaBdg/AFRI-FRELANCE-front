import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import FreelancerCard from "@/components/FreelancerCard";
import { CATEGORIES, formatMoney } from "@/lib/mockData";
import { fetchFreelancers, matchFreelancersToProject } from "@/lib/freelancerView";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";

const steps = ["Titre", "Description", "Compétences", "Budget", "Deadline", "Publication"];

export default function PostProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "web", skills: [], budgetMin: 500000, budgetMax: 800000, budgetType: "fixed", deadline: "2026-10-01",
  });
  const [skillInput, setSkillInput] = useState("");
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const publish = async () => {
    setError("");
    setPublishing(true);
    try {
      await api.entities.Project.create({
        title: form.title,
        description: form.description,
        category: form.category,
        skills: form.skills,
        budget_min: form.budgetMin,
        budget_max: form.budgetMax,
        budget_type: form.budgetType,
        deadline: form.deadline,
        status: "published",
        client_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "Client"),
        country: "Sénégal",
      });
      setDone(true);
      setLoadingMatches(true);
      const fls = await fetchFreelancers({ limit: 50 });
      const fakeProject = { skills: form.skills, category: form.category, budgetMax: form.budgetMax };
      setMatches(matchFreelancersToProject(fakeProject, fls));
      setLoadingMatches(false);
    } catch (err) {
      setError(err.message || "Échec de la publication");
    } finally {
      setPublishing(false);
    }
  };

  const addSkill = () => { if (skillInput && !form.skills.includes(skillInput)) setForm({ ...form, skills: [...form.skills, skillInput] }); setSkillInput(""); };
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-light"><Check className="h-8 w-8 text-brand" /></div>
          <h1 className="mt-4 font-display text-3xl font-bold text-brand-ink">Projet publié !</h1>
          <p className="mt-2 text-muted-foreground">Votre projet est désormais visible par les freelances.</p>
        </div>
        <div className="mt-8">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-gold" /><h2 className="font-display text-xl font-bold text-brand-ink">Freelances recommandés</h2></div>
          {loadingMatches ? <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Recherche de talents…</div> :
            matches.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Aucun freelance ne correspond encore précisément — vos compétences seront affinées à mesure que les profils sont créés.</p> : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {matches.map((m) => (
                  <div key={m.freelancer.id} className="relative">
                    <FreelancerCard freelancer={m.freelancer} />
                    <span className="absolute left-4 top-4 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">{m.score}% match</span>
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button className="bg-brand hover:bg-brand-dark" onClick={() => navigate("/dashboard/client")}>Voir mon dashboard</Button>
          <Button variant="outline" onClick={() => navigate("/freelancers")}>Explorer les talents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-ink">Publier un projet</h1>
      <p className="mt-1 text-muted-foreground">Décrivez votre besoin, recevez des propositions en 24h.</p>
      {error && <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="mt-8 flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-brand text-white" : "bg-muted text-muted-foreground"}`}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</div>
              <span className={`mt-1 hidden text-[10px] sm:block ${i <= step ? "text-brand" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < step ? "bg-brand" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <Card className="mt-8 p-6">
        {step === 0 && <div><Label>Titre du projet</Label><Input className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex : Développeur React pour plateforme SaaS" /><p className="mt-2 text-xs text-muted-foreground">Un titre clair attire de meilleurs talents.</p></div>}
        {step === 1 && <div><Label>Description</Label><Textarea className="mt-2" rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez votre projet, vos objectifs et vos attentes..." /></div>}
        {step === 2 && (
          <div>
            <Label>Catégories & compétences recherchées</Label>
            <select className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="mt-3 flex gap-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Ajouter une compétence (ex: React)" />
              <Button variant="outline" onClick={addSkill}>Ajouter</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{form.skills.map((s) => <Badge key={s} className="gap-1">{s} <button onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })} className="ml-1">×</button></Badge>)}</div>
          </div>
        )}
        {step === 3 && (
          <div>
            <Label>Type de budget</Label>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setForm({ ...form, budgetType: "fixed" })} className={`flex-1 rounded-xl border p-3 text-sm ${form.budgetType === "fixed" ? "border-brand bg-brand-light text-brand" : "border-border"}`}><b>Budget fixe</b><p className="text-xs text-muted-foreground">Prix total du projet</p></button>
              <button onClick={() => setForm({ ...form, budgetType: "monthly" })} className={`flex-1 rounded-xl border p-3 text-sm ${form.budgetType === "monthly" ? "border-brand bg-brand-light text-brand" : "border-border"}`}><b>Tarif mensuel</b><p className="text-xs text-muted-foreground">Paiement récurrent</p></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><Label>Minimum (FCFA)</Label><Input type="number" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })} /></div>
              <div><Label>Maximum (FCFA)</Label><Input type="number" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })} /></div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Commission AfriFreelance : 10% — le freelance reçoit {formatMoney(Math.round(form.budgetMin * 0.9))} à {formatMoney(Math.round(form.budgetMax * 0.9))}.</p>
          </div>
        )}
        {step === 4 && <div><Label>Date limite</Label><Input type="date" className="mt-2" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /><p className="mt-2 text-xs text-muted-foreground">Indiquez quand vous souhaitez que le projet soit livré.</p></div>}
        {step === 5 && (
          <div>
            <h3 className="font-semibold">Résumé de votre projet</h3>
            <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Titre</span><span className="font-medium">{form.title || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Catégorie</span><span>{CATEGORIES.find((c) => c.id === form.category)?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Compétences</span><span>{form.skills.join(", ") || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span>{form.budgetType === "fixed" ? `${formatMoney(form.budgetMin)} – ${formatMoney(form.budgetMax)}` : `${formatMoney(form.budgetMin)}/mois`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span>{form.deadline}</span></div>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={prev} disabled={step === 0}>Précédent</Button>
        {step < steps.length - 1 ? <Button className="bg-brand hover:bg-brand-dark" onClick={next}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button> :
          <Button className="bg-brand hover:bg-brand-dark" onClick={publish} disabled={publishing}>{publishing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publication…</> : "Publier le projet"}</Button>}
      </div>
    </div>
  );
}
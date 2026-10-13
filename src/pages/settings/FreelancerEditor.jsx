import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CheckCircle2, ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import ChipInput from "@/components/settings/ChipInput";
import RepeatFields from "@/components/settings/RepeatFields";
import { ensureFreelancerProfile, SKILL_SUGGESTIONS, SKILL_LEVELS, LANG_LEVELS, LANGUAGES, CURRENCIES, AVAILABILITY_STATUS, COMMITMENTS, WORK_TYPES, PROJECT_TYPES, COUNTRIES, computeCompletion } from "@/lib/profiles";

export default function FreelancerEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const p = await ensureFreelancerProfile(user, user?.avatar_url).catch((e) => { console.error(e); return null; });
      if (p && !p.avatar_url && user?.avatar_url) p.avatar_url = user.avatar_url;
      setProfile(p);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [user?.id]);

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de votre profil freelance…</div>;
  if (!profile) return <div className="text-sm text-destructive">Impossible de charger le profil freelance. Réessayez plus tard.</div>;

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const setLinks = (k, v) => set("links", { ...profile.links, [k]: v });
  const setPrefs = (k, v) => set("preferences", { ...profile.preferences, [k]: v });
  const setVerif = (k, v) => set("verification", { ...profile.verification, [k]: v });
  const toggleArr = (k, val) => setPrefs(k, profile.preferences[k].includes(val) ? profile.preferences[k].filter((x) => x !== val) : [...profile.preferences[k], val]);

  const save = async () => {
    setError(""); setSavedAt(false);
    if (!profile.headline?.trim()) { setError("Le titre professionnel est obligatoire."); return; }
    setSaving(true);
    try {
      const { user_id, id, created_date, updated_date, created_by_id, ...data } = profile;
      await base44.entities.FreelancerProfile.update(profile.id, data);
      const newVerified = !!(profile.verification.email && profile.verification.phone && profile.verification.identity && profile.verification.professional);
      if (newVerified !== profile.verified) await base44.entities.FreelancerProfile.update(profile.id, { verified: newVerified });
      setSavedAt(true); setTimeout(() => setSavedAt(false), 2500);
    } catch (err) { setError(err.message || "Échec de l'enregistrement"); }
    finally { setSaving(false); }
  };

  const verifs = profile.verification || {};
  const verifCount = (verifs.email ? 1 : 0) + (verifs.phone ? 1 : 0) + (verifs.identity ? 1 : 0) + (verifs.professional ? 1 : 0);
  const completion = computeCompletion(profile);

  return (
    <div className="space-y-6">
      {/* sticky save bar */}
      <div className="sticky top-16 z-10 flex items-center justify-between rounded-xl border border-border bg-card/95 px-4 py-2.5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="secondary" className="font-medium">Profil : {completion}%</Badge>
          {savedAt && <span className="flex items-center gap-1 text-brand"><CheckCircle2 className="h-4 w-4" /> Enregistré</span>}
        </div>
        <Button size="sm" onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="mr-1 h-4 w-4" /> Enregistrer</>}</Button>
      </div>
      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {/* Identité */}
      <Card>
        <CardHeader><CardTitle>Identité professionnelle</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Titre professionnel *</Label><Input value={profile.headline || ""} onChange={(e) => set("headline", e.target.value)} placeholder="ex: Développeuse Full-Stack Java & Spring Boot" /></div>
          <div className="space-y-1.5"><Label>Présentation</Label><Textarea value={profile.bio || ""} onChange={(e) => set("bio", e.target.value)} rows={4} placeholder="Décrivez votre expertise…" /><p className="text-right text-xs text-muted-foreground">{(profile.bio || "").length}/600</p></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Pays</Label><select value={profile.country || ""} onChange={(e) => set("country", e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"><option value="">—</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input value={profile.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="Dakar" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Compétences */}
      <Card>
        <CardHeader><CardTitle>Compétences</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Recherchez une compétence puis ajoutez-la avec son niveau.</p>
          <ChipInput items={profile.skills} onChange={(v) => set("skills", v)} levels={SKILL_LEVELS} suggestions={SKILL_SUGGESTIONS} placeholder="Java, Spring Boot…" />
        </CardContent>
      </Card>

      {/* Tarifs */}
      <Card>
        <CardHeader><CardTitle>Mes tarifs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Tarif horaire</Label><Input type="number" min="0" value={profile.hourly_rate ?? ""} onChange={(e) => set("hourly_rate", e.target.value === "" ? null : Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Tarif journalier</Label><Input type="number" min="0" value={profile.daily_rate ?? ""} onChange={(e) => set("daily_rate", e.target.value === "" ? null : Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Tarif minimum par projet</Label><Input type="number" min="0" value={profile.min_project_rate ?? ""} onChange={(e) => set("min_project_rate", e.target.value === "" ? null : Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Devise</Label><select value={profile.currency || "USD"} onChange={(e) => set("currency", e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">{CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          </div>
          <p className="text-xs text-muted-foreground">Les tarifs affichés peuvent varier selon la devise et le projet.</p>
        </CardContent>
      </Card>

      {/* Disponibilité */}
      <Card>
        <CardHeader><CardTitle>Disponibilité</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_STATUS.map((a) => (
                  <button type="button" key={a.value} onClick={() => set("availability_status", a.value)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${profile.availability_status === a.value ? "border-brand bg-brand text-white" : "border-border hover:border-brand/40"}`}><span className={`h-2 w-2 rounded-full ${a.dot}`} /> {a.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Engagement</Label>
              <div className="flex flex-wrap gap-2">
                {COMMITMENTS.map((a) => (
                  <button type="button" key={a.value} onClick={() => set("availability_commitment", a.value)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${profile.availability_commitment === a.value ? "border-brand bg-brand text-white" : "border-border hover:border-brand/40"}`}>{a.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Disponibilité estimée (h/semaine)</Label><Input type="number" min="0" max="80" value={profile.hours_per_week ?? ""} onChange={(e) => set("hours_per_week", e.target.value === "" ? null : Number(e.target.value))} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Expérience */}
      <Card>
        <CardHeader><CardTitle>Expérience professionnelle</CardTitle></CardHeader>
        <CardContent>
          <RepeatFields items={profile.experience} onChange={(v) => set("experience", v)} titleKey="title" addLabel="Ajouter une expérience" emptyLabel="Vous n'avez pas encore ajouté d'expérience." fields={[
            { key: "title", label: "Poste", placeholder: "Full-Stack Developer" },
            { key: "company", label: "Entreprise", placeholder: "Gaindé 2000" },
            { key: "country", label: "Pays", type: "select", options: COUNTRIES.map((c) => ({ value: c, label: c })) },
            { key: "start", label: "Début", type: "date" },
            { key: "end", label: "Fin", type: "date" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "current", label: "Actuellement en poste", type: "checkbox" },
          ]} />
        </CardContent>
      </Card>

      {/* Formation */}
      <Card>
        <CardHeader><CardTitle>Formation</CardTitle></CardHeader>
        <CardContent>
          <RepeatFields items={profile.education} onChange={(v) => set("education", v)} titleKey="school" addLabel="Ajouter une formation" emptyLabel="Aucune formation ajoutée." fields={[
            { key: "school", label: "Établissement", placeholder: "UCAD Dakar" },
            { key: "degree", label: "Diplôme", placeholder: "Master" },
            { key: "field", label: "Domaine", placeholder: "Informatique" },
            { key: "start", label: "Début", type: "date" },
            { key: "end", label: "Fin", type: "date" },
            { key: "description", label: "Description", type: "textarea" },
          ]} />
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
        <CardContent>
          <RepeatFields items={profile.certifications} onChange={(v) => set("certifications", v)} titleKey="name" addLabel="Ajouter une certification" emptyLabel="Aucune certification ajoutée." fields={[
            { key: "name", label: "Nom", placeholder: "AWS Solutions Architect" },
            { key: "issuer", label: "Organisme", placeholder: "Amazon" },
            { key: "date", label: "Date", type: "date" },
            { key: "url", label: "URL de vérification", placeholder: "https://…" },
            { key: "credential_id", label: "Identifiant", placeholder: "ABC-123" },
          ]} />
        </CardContent>
      </Card>

      {/* Langues */}
      <Card>
        <CardHeader><CardTitle>Langues</CardTitle></CardHeader>
        <CardContent>
          <ChipInput items={profile.languages} onChange={(v) => set("languages", v)} levels={LANG_LEVELS} suggestions={LANGUAGES} placeholder="Ajouter une langue…" />
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader><CardTitle>Portfolio — Mes réalisations</CardTitle></CardHeader>
        <CardContent>
          <RepeatFields items={profile.portfolio} onChange={(v) => set("portfolio", v)} titleKey="title" addLabel="Ajouter une réalisation" emptyLabel="Vous n'avez pas encore ajouté de réalisation." fields={[
            { key: "image", label: "Image", type: "image" },
            { key: "title", label: "Titre", placeholder: "AfriFreelance" },
            { key: "role", label: "Votre rôle", placeholder: "Lead Dev" },
            { key: "date", label: "Date", type: "date" },
            { key: "technologies", label: "Technologies", type: "tags" },
            { key: "url", label: "URL", placeholder: "https://…" },
            { key: "description", label: "Description", type: "textarea" },
          ]} />
        </CardContent>
      </Card>

      {/* Liens */}
      <Card>
        <CardHeader><CardTitle>Liens professionnels</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[["linkedin","LinkedIn"],["github","GitHub"],["behance","Behance"],["dribbble","Dribbble"],["website","Site personnel"],["other","Autre"]].map(([k,l]) => (
            <div key={k} className="space-y-1.5"><Label>{l}</Label><Input value={profile.links?.[k] || ""} onChange={(e) => setLinks(k, e.target.value)} placeholder="https://…" /></div>
          ))}
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader><CardTitle>Préférences de travail</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Type de travail</Label><div className="flex flex-wrap gap-2">{WORK_TYPES.map((t) => <button type="button" key={t} onClick={() => toggleArr("work_types", t)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${(profile.preferences?.work_types||[]).includes(t) ? "border-brand bg-brand text-white" : "border-border hover:border-brand/40"}`}>{t}</button>)}</div></div>
          <div className="space-y-1.5"><Label>Types de projets</Label><div className="flex flex-wrap gap-2">{PROJECT_TYPES.map((t) => <button type="button" key={t} onClick={() => toggleArr("project_types", t)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${(profile.preferences?.project_types||[]).includes(t) ? "border-brand bg-brand text-white" : "border-border hover:border-brand/40"}`}>{t}</button>)}</div></div>
          <div className="space-y-1.5"><Label>Pays acceptés</Label>
            <div className="flex flex-wrap gap-2">
              {(profile.preferences?.countries||[]).map((c,i)=>(<span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-light/40 px-2.5 py-1 text-xs text-brand">{c}<button onClick={()=>setPrefs("countries",(profile.preferences.countries||[]).filter((_,idx)=>idx!==i))} className="text-brand/60 hover:text-brand">×</button></span>))}
              <select onChange={(e)=>{ const v=e.target.value; if(v) setPrefs("countries",[...(profile.preferences.countries||[]),v]); e.target.value=""; }} className="h-8 rounded-md border border-input px-2 text-sm"><option value="">+ ajouter…</option>{COUNTRIES.map((c)=><option key={c}>{c}</option>)}</select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vérification */}
      <Card>
        <CardHeader><CardTitle>Vérification du profil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm"><ShieldAlert className="h-4 w-4 text-amber-500" /> {verifCount}/4 vérifications complétées</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {["email","phone","identity","professional"].map((k) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="flex items-center gap-2 text-sm capitalize">{verifs[k] ? <ShieldCheck className="h-4 w-4 text-brand" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />} {k === "email" ? "Email" : k === "phone" ? "Téléphone" : k === "identity" ? "Identité" : "Professionnel"}</span>
                <Button size="sm" variant={verifs[k] ? "secondary" : "outline"} className={verifs[k] ? "pointer-events-none" : ""} onClick={() => setVerif(k, !verifs[k])}>{verifs[k] ? "Vérifié" : "Vérifier"}</Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">POC : la vérification est simulée. La complète décerne un badge « Profil vérifié ».</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="mr-2 h-4 w-4" /> Enregistrer le profil</>}</Button>
      </div>
    </div>
  );
}
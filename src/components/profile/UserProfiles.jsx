import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, Building2, Plus, Pencil } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { skillName } from "@/lib/profiles";

const AVAILABILITY = [
  { value: "full_time", label: "Temps plein" },
  { value: "part_time", label: "Temps partiel" },
  { value: "per_project", label: "Par mission" },
];

const cnList = (arr) => (Array.isArray(arr) ? arr.join(", ") : arr || "");

export default function UserProfiles() {
  const { user, checkUserAuth } = useAuth();
  const [freelance, setFreelance] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [f, c] = await Promise.all([
        base44.entities.FreelancerProfile.filter({ created_by_id: user.id }).catch(() => []),
        base44.entities.ClientProfile.filter({ created_by_id: user.id }).catch(() => []),
      ]);
      setFreelance(Array.isArray(f) ? f[0] : null);
      setClient(Array.isArray(c) ? c[0] : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();   }, [user?.id]);

  const setActive = async (type) => {
    try {
      await base44.auth.updateMe({ account_type: type });
      await checkUserAuth();
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des profils…</div>;
  }

  return (
    <div className="mt-8 space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold text-brand-ink">Mes profils</h2>
        <p className="text-sm text-muted-foreground">Un même compte peut être Client <span className="font-medium">et</span> Freelance. Activez le profil que vous souhaitez utiliser dans l'app.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <FreelanceCard
          profile={freelance}
          editing={editing === "freelance"}
          onEdit={() => setEditing(editing === "freelance" ? null : "freelance")}
          onSaved={(p) => { setFreelance(p); setEditing(null); setActive("ROLE_FREELANCER"); }}
          active={user?.account_type === "ROLE_FREELANCER"}
          onActivate={() => setActive("ROLE_FREELANCER")}
        />
        <ClientCard
          profile={client}
          editing={editing === "client"}
          onEdit={() => setEditing(editing === "client" ? null : "client")}
          onSaved={(p) => { setClient(p); setEditing(null); setActive("ROLE_CLIENT"); }}
          active={user?.account_type === "ROLE_CLIENT"}
          onActivate={() => setActive("ROLE_CLIENT")}
        />
      </div>
    </div>
  );
}

function FreelanceCard({ profile, editing, onEdit, onSaved, active, onActivate }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 font-semibold"><Briefcase className="h-4 w-4 text-brand" /> Profil Freelance {active && <Badge variant="secondary" className="ml-1">Actif</Badge>}</CardTitle>
        {profile && !editing && <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>}
      </CardHeader>
      <CardContent>
        {editing ? (
          <FreelanceForm initial={profile} onSaved={onSaved} onCancel={onEdit} />
        ) : profile ? (
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-brand-ink">{profile.headline}</p>
            {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
            {profile.skills?.length > 0 && <p><span className="text-muted-foreground">Compétences : </span>{profile.skills.map(skillName).join(", ")}</p>}
            {profile.hourly_rate != null && <p><span className="text-muted-foreground">Tarif : </span>{profile.hourly_rate} $/h — {AVAILABILITY.find(a => a.value === profile.availability)?.label}</p>}
            {profile.country && <p><span className="text-muted-foreground">Pays : </span>{profile.country}</p>}
            {!active && <Button size="sm" variant="outline" className="mt-2" onClick={onActivate}>Activer ce profil</Button>}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">Pas encore de profil freelance.</p>
            <Button size="sm" variant="outline" onClick={onEdit}><Plus className="mr-2 h-4 w-4" /> Créer mon profil freelance</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FreelanceForm({ initial, onSaved, onCancel }) {
  const [headline, setHeadline] = useState(initial?.headline || "");
  const [bio, setBio] = useState(initial?.bio || "");
  const [skills, setSkills] = useState(cnList(initial?.skills));
  const [hourlyRate, setHourlyRate] = useState(initial?.hourly_rate ?? "");
  const [availability, setAvailability] = useState(initial?.availability || "per_project");
  const [country, setCountry] = useState(initial?.country || "");
  const [languages, setLanguages] = useState(cnList(initial?.languages));
  const [portfolioUrl, setPortfolioUrl] = useState(initial?.portfolio_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!headline.trim()) return setError("Le titre est requis.");
    setSaving(true); setError("");
    try {
      const data = {
        headline: headline.trim(),
        bio: bio.trim(),
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        hourly_rate: hourlyRate === "" ? null : Number(hourlyRate),
        availability,
        country: country.trim(),
        languages: languages.split(",").map(s => s.trim()).filter(Boolean),
        portfolio_url: portfolioUrl.trim() || null,
      };
      const result = initial?.id
        ? await base44.entities.FreelancerProfile.update(initial.id, data)
        : await base44.entities.FreelancerProfile.create(data);
      onSaved(result);
    } catch (err) {
      setError(err.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Titre / accroche</Label>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="ex: Développeur Full-Stack React & Node" />
      </div>
      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Décrivez votre expertise en quelques lignes" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Compétences (séparées par virgules)</Label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node, Figma" />
        </div>
        <div className="space-y-1.5">
          <Label>Tarif horaire ($)</Label>
          <Input type="number" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="35" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Disponibilité</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY.map((a) => (
            <button type="button" key={a.value} onClick={() => setAvailability(a.value)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${availability === a.value ? "border-brand bg-brand text-white" : "border-border text-muted-foreground hover:border-brand/40"}`}>{a.label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Pays</Label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Sénégal" />
        </div>
        <div className="space-y-1.5">
          <Label>Langues</Label>
          <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Français, Anglais" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Portfolio (URL)</Label>
        <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…</> : initial?.id ? "Mettre à jour" : "Créer le profil"}</Button>
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}

function ClientCard({ profile, editing, onEdit, onSaved, active, onActivate }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4 text-brand" /> Profil Client {active && <Badge variant="secondary" className="ml-1">Actif</Badge>}</CardTitle>
        {profile && !editing && <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>}
      </CardHeader>
      <CardContent>
        {editing ? (
          <ClientForm initial={profile} onSaved={onSaved} onCancel={onEdit} />
        ) : profile ? (
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-brand-ink">{profile.display_name} <Badge variant="outline" className="ml-1">{profile.kind === "company" ? "Entreprise" : "Particulier"}</Badge></p>
            {profile.description && <p className="text-muted-foreground">{profile.description}</p>}
            {profile.country && <p><span className="text-muted-foreground">Pays : </span>{profile.country}</p>}
            {profile.website && <p><a href={profile.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">{profile.website}</a></p>}
            {!active && <Button size="sm" variant="outline" className="mt-2" onClick={onActivate}>Activer ce profil</Button>}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">Pas encore de profil client.</p>
            <Button size="sm" variant="outline" onClick={onEdit}><Plus className="mr-2 h-4 w-4" /> Créer mon profil client</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClientForm({ initial, onSaved, onCancel }) {
  const [displayName, setDisplayName] = useState(initial?.display_name || "");
  const [kind, setKind] = useState(initial?.kind || "individual");
  const [description, setDescription] = useState(initial?.description || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [website, setWebsite] = useState(initial?.website || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!displayName.trim()) return setError("Le nom est requis.");
    setSaving(true); setError("");
    try {
      const data = {
        display_name: displayName.trim(),
        kind,
        description: description.trim(),
        country: country.trim(),
        website: website.trim() || null,
      };
      const result = initial?.id
        ? await base44.entities.ClientProfile.update(initial.id, data)
        : await base44.entities.ClientProfile.create(data);
      onSaved(result);
    } catch (err) {
      setError(err.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Nom (particulier ou entreprise)</Label>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="ex: Acme Inc." />
      </div>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <div className="flex gap-2">
          {[{ value: "individual", label: "Particulier" }, { value: "company", label: "Entreprise" }].map((k) => (
            <button type="button" key={k.value} onClick={() => setKind(k.value)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${kind === k.value ? "border-brand bg-brand text-white" : "border-border text-muted-foreground hover:border-brand/40"}`}>{k.label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Décrivez votre activité / vos besoins" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Pays</Label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Sénégal" />
        </div>
        <div className="space-y-1.5">
          <Label>Site web</Label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…</> : initial?.id ? "Mettre à jour" : "Créer le profil"}</Button>
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}
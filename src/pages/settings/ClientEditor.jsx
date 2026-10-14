import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { ensureClientProfile, COUNTRIES, validateUrl } from "@/lib/profiles";

export default function ClientEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const p = await ensureClientProfile(user).catch((e) => { console.error(e); return null; });
      if (p && !p.avatar_url && user?.avatar_url) p.avatar_url = user.avatar_url;
      setProfile(p); setLoading(false);
    })();
     
  }, [user?.id]);

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;
  if (!profile) return <div className="text-sm text-destructive">Impossible de charger le profil client.</div>;

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setError(""); setSavedAt(false);
    if (!profile.display_name?.trim()) { setError("Le nom affiché est obligatoire."); return; }
    if (profile.website) { const u = validateUrl(profile.website); if (u) { setError(u); return; } }
    setSaving(true);
    try {
      const { user_id, id, created_date, updated_date, created_by_id, ...data } = profile;
      await api.entities.ClientProfile.update(profile.id, data);
      setSavedAt(true); setTimeout(() => setSavedAt(false), 2500);
    } catch (err) { setError(err.message || "Échec de l'enregistrement"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profil Client</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Nom affiché *</Label><Input value={profile.display_name || ""} onChange={(e) => set("display_name", e.target.value)} placeholder="Sarr Bloom / Acme Inc." /></div>
            <div className="space-y-1.5"><Label>Type</Label><div className="flex gap-2">{[["individual","Particulier"],["company","Entreprise"]].map(([v,l]) => (<button type="button" key={v} onClick={() => set("kind", v)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${profile.kind === v ? "border-brand bg-brand text-white" : "border-border hover:border-brand/40"}`}>{l}</button>))}</div></div>
            <div className="space-y-1.5"><Label>Pays</Label><select value={profile.country || ""} onChange={(e) => set("country", e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"><option value="">—</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input value={profile.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="Dakar" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Site web</Label><Input value={profile.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://…" /></div>
          </div>
          <div className="space-y-1.5"><Label>Présentation</Label><Textarea value={profile.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Décrivez votre activité et vos besoins…" /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="mr-1 h-4 w-4" /> Enregistrer</>}</Button>
            {savedAt && <span className="flex items-center gap-1 text-sm text-brand"><CheckCircle2 className="h-4 w-4" /> Enregistré</span>}
          </div>
        </CardContent>
      </Card>

      {profile.kind === "company" && (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 pt-6">
            <p className="text-sm text-muted-foreground">Complétez les informations de votre entreprise dans l'espace dédié.</p>
            <Button asChild variant="outline" size="sm"><Link to="/settings/company">Gérer mon entreprise</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
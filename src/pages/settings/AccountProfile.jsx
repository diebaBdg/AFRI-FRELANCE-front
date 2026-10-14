import { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import { Loader2, Save, CheckCircle2, Camera, Trash2, ChevronDown } from "lucide-react";
import { COUNTRIES, LANGUAGES, TIMEZONES, parseUsername, validateEmail } from "@/lib/profiles";

const initials = (name, email) => (name || email || "?").trim().charAt(0).toUpperCase();

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className="h-9 w-full appearance-none rounded-md border border-input bg-card px-3 pr-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export default function AccountProfile() {
  const { user, checkUserAuth } = useAuth();
  const [form, setForm] = useState({ display_name: "", full_name: "", username: "", email: "", phone: "", country: "", city: "", language: "", timezone: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || user.full_name || "",
        full_name: user.full_name || "",
        username: user.username ? user.username.replace(/^@/, "") : "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        language: user.language || "",
        timezone: user.timezone || "",
      });
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setUploading(true); setError("");
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      await api.auth.updateMe({ avatar_url: file_url });
      setAvatarUrl(file_url);
      await checkUserAuth();
    } catch (err) { setError(err.message || "Échec de l'envoi"); }
    finally { setUploading(false); }
  };
  const removeAvatar = async () => {
    try { await api.auth.updateMe({ avatar_url: "" }); setAvatarUrl(""); await checkUserAuth(); } catch {}
  };

  const save = async () => {
    setError("");
    if (form.email && validateEmail(form.email)) return setError("Format d'email invalide.");
    if (form.username && !/^[a-z0-9_]{2,24}$/.test(form.username)) return setError("Username : lettres minuscules, chiffres, _ (2 à 24 caractères).");
    setSaving(true);
    try {
      const payload = {
        display_name: form.display_name,
        username: form.username || "",
        phone: form.phone,
        country: form.country,
        city: form.city,
        language: form.language,
        timezone: form.timezone,
      };
      await api.auth.updateMe(payload);
      await checkUserAuth();
      setSavedAt(true); setTimeout(() => setSavedAt(false), 2500);
    } catch (err) { setError(err.message || "Échec de l'enregistrement"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>Votre photo apparaît sur votre profil public et dans vos échanges.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-border bg-brand-light text-brand sm:h-28 sm:w-28">
                {avatarUrl ? <Image src={avatarUrl} alt="" fittingType="fill" className="h-full w-full" /> : <span className="text-3xl font-bold">{initials(user?.display_name || user?.full_name, user?.email)}</span>}
              </div>
              <label className="absolute -bottom-1.5 -right-1.5 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-white bg-brand text-white shadow-md transition-colors hover:bg-brand-dark">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    {uploading ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Envoi…</> : <><Camera className="mr-1.5 h-4 w-4" /> Changer la photo</>}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
                  </label>
                </Button>
                {avatarUrl && <Button variant="ghost" size="sm" className="text-destructive" onClick={removeAvatar}><Trash2 className="mr-1.5 h-4 w-4" /> Supprimer</Button>}
              </div>
              <p className="text-xs text-muted-foreground">Format carré, bonne qualité, visage visible, fond neutre.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Ces détails alimentent votre identité publique et votre compatibilité avec les missions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Votre nom</Label><Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} placeholder="Votre nom affiché" /></div>
            <div className="space-y-1.5"><Label>Nom d'utilisateur</Label><div className="flex items-stretch"><span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground">@</span><Input className="rounded-l-none" value={form.username} onChange={(e) => set("username", parseUsername(e.target.value))} placeholder="sarrbloom" /></div></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} disabled className="bg-muted/40 text-muted-foreground" /></div>
            <div className="space-y-1.5"><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+221 ..." /></div>
            <div className="space-y-1.5"><Label>Pays</Label><SelectField value={form.country} onChange={(e) => set("country", e.target.value)}><option value="">— Sélectionner —</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</SelectField></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Dakar" /></div>
            <div className="space-y-1.5"><Label>Langue principale</Label><SelectField value={form.language} onChange={(e) => set("language", e.target.value)}><option value="">— Sélectionner —</option>{LANGUAGES.map((c) => <option key={c}>{c}</option>)}</SelectField></div>
            <div className="space-y-1.5"><Label>Fuseau horaire</Label><SelectField value={form.timezone} onChange={(e) => set("timezone", e.target.value)}><option value="">— Sélectionner —</option>{TIMEZONES.map((c) => <option key={c}>{c}</option>)}</SelectField></div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky action bar */}
      <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        {error && <p className="mr-auto text-sm text-destructive">{error}</p>}
        {savedAt && !error && <span className="mr-auto flex items-center gap-1 text-sm text-brand"><CheckCircle2 className="h-4 w-4" /> Profil mis à jour</span>}
        <Button onClick={save} disabled={saving} className="ml-auto min-w-[150px]">{saving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="mr-1.5 h-4 w-4" /> Enregistrer</>}</Button>
      </div>
    </div>
  );
}
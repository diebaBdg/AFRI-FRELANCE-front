import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { Camera, Loader2, ShieldCheck, Mail, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { SIGNUP_TYPES, ROLE_META, roleLabel, roleDesc, isStaff } from "@/lib/roles";
import UserProfiles from "@/components/profile/UserProfiles";

const initials = (name, email) => (name || email || "?").trim().charAt(0).toUpperCase();

export default function Profile() {
  const { user, checkUserAuth } = useAuth();
  const [accountType, setAccountType] = useState("ROLE_CLIENT");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setAccountType(user.account_type || "ROLE_CLIENT");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      await api.auth.updateMe({ avatar_url: file_url });
      setAvatarUrl(file_url);
      await checkUserAuth();
    } catch (err) {
      setError(err.message || "Échec de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedAt(false);
    try {
      await api.auth.updateMe({ account_type: accountType });
      await checkUserAuth();
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 2500);
    } catch (err) {
      setError(err.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const editable = !isStaff(user?.account_type) && user?.account_type !== "ROLE_VERIFIED_FREELANCER";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-brand-ink" />
        <CardContent className="-mt-12 px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-brand-light text-brand shadow-lg">
                {avatarUrl
                  ? <Image src={avatarUrl} alt="avatar" fittingType="fill" className="h-full w-full" />
                  : <span className="text-3xl font-bold">{initials(user?.full_name, user?.email)}</span>}
              </div>
              <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-white text-brand shadow hover:bg-muted">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-brand-ink">{user?.full_name || user?.email?.split("@")[0] || "Mon compte"}</h1>
                <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3 text-brand" /> {roleLabel(user?.account_type)}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> {user?.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">{roleDesc(user?.account_type)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Account type */}
        <Card>
          <CardHeader><CardTitle>Type de compte</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {editable ? (
              <>
                <div className="space-y-2">
                  <Label>Votre rôle sur la plateforme</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SIGNUP_TYPES.map((t) => {
                      const active = accountType === t;
                      return (
                        <button key={t} type="button" onClick={() => setAccountType(t)} className={`rounded-xl border p-3 text-left transition-all ${active ? "border-brand bg-brand-light/60 ring-2 ring-brand/30" : "border-border hover:border-brand/40"}`}>
                          <p className="text-sm font-semibold text-brand-ink">{ROLE_META[t].label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{ROLE_META[t].desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
                </Button>
                {savedAt && <p className="flex items-center gap-1 text-sm text-brand"><CheckCircle2 className="h-4 w-4" /> Enregistré</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ce rôle (<span className="font-semibold text-brand-ink">{roleLabel(user?.account_type)}</span>) est assigné par la plateforme et n'est pas modifiable. {roleDesc(user?.account_type)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader><CardTitle>Photo de profil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Une photo professionnelle augmente la confiance et le taux de réponse.</p>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-border bg-brand-light text-brand">
                {avatarUrl
                  ? <Image src={avatarUrl} alt="" fittingType="fill" className="h-full w-full" />
                  : <span className="text-xl font-bold">{initials(user?.full_name, user?.email)}</span>}
              </div>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  {uploading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi…</>
                    : <><Camera className="mr-2 h-4 w-4" /> {avatarUrl ? "Changer la photo" : "Ajouter une photo"}</>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </Button>
            </div>
            {avatarUrl && <p className="text-xs text-muted-foreground">Mise à jour automatique après l'envoi.</p>}
          </CardContent>
        </Card>
      </div>

      <UserProfiles />
    </div>
  );
}
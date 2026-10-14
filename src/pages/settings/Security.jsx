import { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SecurityPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    api.entities.Security.info()
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    if (!STRONG_PASSWORD.test(newPassword)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    try {
      await api.auth.changePassword({ oldPassword, newPassword });
      setOk("Mot de passe mis à jour.");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || "Impossible de changer le mot de passe.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const checks = [
    ["Email", !!info?.email],
    ["Téléphone", !!info?.phone],
    ["Mot de passe", info?.hasPassword !== false],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Vérifications du compte</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {checks.map(([l, done]) => (
            <div key={l} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="flex items-center gap-2 text-sm">{done ? <ShieldCheck className="h-4 w-4 text-brand" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />} {l}</span>
              <Badge variant={done ? "default" : "secondary"}>{done ? "Renseigné" : "Manquant"}</Badge>
            </div>
          ))}
          {info?.lastPasswordChange && (
            <p className="text-xs text-muted-foreground">Dernier changement de mot de passe : {new Date(info.lastPasswordChange).toLocaleDateString("fr-FR")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Changer le mot de passe</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="old">Mot de passe actuel</Label>
              <Input id="old" type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">Nouveau mot de passe</Label>
              <Input id="new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmer</Label>
              <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {ok && <p className="text-sm text-brand">{ok}</p>}
            <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />…</> : "Enregistrer"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

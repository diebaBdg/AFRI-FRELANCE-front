import { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const GROUPS = [
  {
    title: "E-mail",
    items: [
      ["emailMessages", "Messages par e-mail"],
      ["emailProjectUpdates", "Mises à jour de projet"],
      ["emailMarketing", "Newsletter et conseils"],
    ],
  },
  {
    title: "Notifications push",
    items: [
      ["pushMessages", "Nouveau message"],
      ["pushProjectUpdates", "Mise à jour de projet"],
      ["pushContractUpdates", "Contrats"],
      ["pushPaymentUpdates", "Paiements"],
    ],
  },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.entities.NotificationPreferences.get()
      .then((data) => setPrefs(data || {}))
      .catch((err) => setError(err.message || "Impossible de charger les préférences."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    setError("");
    try {
      const saved = await api.entities.NotificationPreferences.update(next);
      setPrefs(saved || next);
    } catch (err) {
      setError(err.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {saving && <p className="text-xs text-muted-foreground">Enregistrement…</p>}
      {GROUPS.map((g) => (
        <Card key={g.title}>
          <CardHeader><CardTitle>{g.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {g.items.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <Switch checked={!!prefs?.[key]} onCheckedChange={(v) => toggle(key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

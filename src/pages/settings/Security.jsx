import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, KeyRound, MonitorSmartphone } from "lucide-react";

export default function SecurityPage() {
  const sessions = [
    { device: "Chrome — Dakar, Sénégal", current: true, time: "Maintenant" },
    { device: "Safari — iPhone", current: false, time: "Il y a 2 jours" },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Vérifications du compte</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[["Email", true], ["Téléphone", false], ["Identité", false]].map(([l, done]) => (
            <div key={l} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="flex items-center gap-2 text-sm">{done ? <ShieldCheck className="h-4 w-4 text-brand" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />} {l}</span>
              <Badge variant={done ? "default" : "secondary"}>{done ? "Vérifié" : "Non vérifié"}</Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">La vérification d'identité renforce la confiance et débloque le badge vérifié.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mot de passe</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Géré de manière sécurisée par la plateforme.</p>
          <Button asChild variant="outline" size="sm"><a href="/forgot-password">Changer le mot de passe</a></Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sessions actives</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="flex items-center gap-2 text-sm"><MonitorSmartphone className="h-4 w-4 text-muted-foreground" /> {s.device} {s.current && <Badge variant="secondary" className="ml-1">Cet appareil</Badge>}</span>
              <span className="text-xs text-muted-foreground">{s.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
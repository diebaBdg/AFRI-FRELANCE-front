import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationsPage() {
  const groups = [
    { title: "Projets", items: [["Nouvelles candidatures reçues", true], ["Mise à jour de projet", true], ["Projet recommandé", false]] },
    { title: "Messages", items: [["Nouveau message", true], ["Mentions", true]] },
    { title: "Paiements", items: [["Paiement reçu", true], ["Retrait traité", true]] },
    { title: "Plateforme", items: [["Newsletter AfriFreelance", false], ["Tips & bonnes pratiques", true]] },
  ];
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <Card key={g.title}>
          <CardHeader><CardTitle>{g.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {g.items.map(([l, def]) => (
              <div key={l} className="flex items-center justify-between">
                <Label className="text-sm">{l}</Label>
                <Switch defaultChecked={def} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
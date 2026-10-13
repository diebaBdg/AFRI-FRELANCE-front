import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CURRENCIES, TIMEZONES } from "@/lib/profiles";

export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Affichage & région</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Devise d'affichage</Label><select className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">{CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div className="space-y-1.5"><Label>Fuseau horaire</Label><select className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">{TIMEZONES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="space-y-1.5"><Label>Langue de l'interface</Label><select className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"><option>Français</option><option>English</option></select></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Confidentialité</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[["Afficher mon profil dans la recherche", true], ["Autoriser le contact par freelance", true], ["Afficher mes statistiques publiques", false]].map(([l, def]) => (
            <div key={l} className="flex items-center justify-between"><Label className="text-sm">{l}</Label><Switch defaultChecked={def} /></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { Loader2, Save, CheckCircle2, Plus, Trash2, Upload, Building2 } from "lucide-react";
import { COUNTRIES, COMPANY_SIZES, COMPANY_ROLES, getMyCompany } from "@/lib/profiles";

export default function CompanyPage() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState({ name: "", email: "", role: "member" });

  useEffect(() => {
    (async () => { if (!user) return; const c = await getMyCompany(user.id); setCompany(c); setLoading(false); })();
  }, [user?.id]);

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const ensure = async () => { setSaving(true); try { const c = await api.entities.Company.create({ name: "Mon entreprise", owner_id: user.id, members: [{ name: user.full_name || user.email, email: user.email, role: "owner" }] }); setCompany(c); } finally { setSaving(false); } };
  const set = (k, v) => setCompany((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!company?.name?.trim()) { setError("Le nom de l'entreprise est obligatoire."); return; }
    setSaving(true); setError("");
    try { await api.entities.Company.update(company.id, company); setSavedAt(true); setTimeout(() => setSavedAt(false), 2500); }
    catch (err) { setError(err.message || "Échec"); } finally { setSaving(false); }
  };

  const addMember = () => {
    if (!member.name.trim()) return;
    set("members", [...(company.members || []), { ...member, name: member.name.trim() }]);
    setMember({ name: "", email: "", role: "member" });
  };
  const removeMember = (i) => set("members", (company.members || []).filter((_, idx) => idx !== i));

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setSaving(true);
    try { const { file_url } = await api.integrations.Core.UploadFile({ file }); set("logo_url", file_url); } finally { setSaving(false); }
  };

  if (!company) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-light text-brand"><Building2 className="h-7 w-7" /></div>
          <h3 className="font-display text-lg font-bold text-brand-ink">Aucune entreprise associée</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Créez ou rejoignez une entreprise pour publier en tant qu'organisation.</p>
          <Button className="bg-brand hover:bg-brand-dark" onClick={ensure} disabled={saving}><Plus className="mr-1 h-4 w-4" /> Créer mon entreprise</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-border bg-brand-light text-brand">{company.logo_url ? <Image src={company.logo_url} alt="" fittingType="fill" className="h-full w-full" /> : <Building2 className="h-7 w-7" />}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild><label className="cursor-pointer"><Upload className="mr-1 h-4 w-4" /> Logo<input type="file" accept="image/*" className="hidden" onChange={uploadLogo} /></label></Button>
              {company.logo_url && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => set("logo_url", "")}><Trash2 className="mr-1 h-4 w-4" /> Retirer</Button>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Nom commercial *</Label><Input value={company.name || ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Nom légal</Label><Input value={company.legal_name || ""} onChange={(e) => set("legal_name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Secteur</Label><Input value={company.sector || ""} onChange={(e) => set("sector", e.target.value)} placeholder="Technologie" /></div>
            <div className="space-y-1.5"><Label>Taille</Label><select value={company.size || ""} onChange={(e) => set("size", e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"><option value="">—</option>{COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Pays</Label><select value={company.country || ""} onChange={(e) => set("country", e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"><option value="">—</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input value={company.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="Dakar" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Site web</Label><Input value={company.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://…" /></div>
          </div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea value={company.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="mr-1 h-4 w-4" /> Enregistrer</>}</Button>
            {savedAt && <span className="flex items-center gap-1 text-sm text-brand"><CheckCircle2 className="h-4 w-4" /> Enregistré</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Membres de l'équipe</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(company.members || []).map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="text-sm"><p className="font-medium text-brand-ink">{m.name}</p>{m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{m.role}</Badge>
                  {m.role !== "owner" && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeMember(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
              </div>
            ))}
            {(!company.members || company.members.length === 0) && <p className="text-sm text-muted-foreground">Aucun membre.</p>}
          </div>
          <div className="grid grid-cols-1 gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Input placeholder="Nom" value={member.name} onChange={(e) => setMember((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Email" value={member.email} onChange={(e) => setMember((p) => ({ ...p, email: e.target.value }))} />
            <select value={member.role} onChange={(e) => setMember((p) => ({ ...p, role: e.target.value }))} className="h-9 rounded-md border border-input px-2 text-sm"><option value="member">Membre</option>{COMPANY_ROLES.filter((r) => r.value !== "owner").map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
            <Button size="sm" variant="outline" onClick={addMember}><Plus className="mr-1 h-4 w-4" /> Ajouter</Button>
          </div>
          <Button onClick={save} disabled={saving} variant="secondary" size="sm"><Save className="mr-1 h-4 w-4" /> Enregistrer l'équipe</Button>
        </CardContent>
      </Card>
    </div>
  );
}
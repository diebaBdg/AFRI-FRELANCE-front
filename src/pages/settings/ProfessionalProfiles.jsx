import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Briefcase, Building2, CheckCircle2, Pencil, Plus, Power, ShieldCheck } from "lucide-react";
import { getMyProfiles, ensureFreelancerProfile, ensureClientProfile, computeCompletion, completionChecks, AVAILABILITY_STATUS, COMMITMENTS } from "@/lib/profiles";

export default function ProfessionalProfiles() {
  const { user, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [freelance, setFreelance] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { freelancer, client } = await getMyProfiles(user.id);
    setFreelance(freelancer); setClient(client); setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const activate = async (type) => {
    setBusy(true);
    try { await base44.auth.updateMe({ account_type: type }); await checkUserAuth(); } catch {} finally { setBusy(false); }
  };

  const startFreelance = async () => {
    setBusy(true);
    try { const p = await ensureFreelancerProfile(user, user?.avatar_url); await load(); await activate("ROLE_FREELANCER"); navigate("/settings/freelancer"); }
    catch (e) { console.error(e); } finally { setBusy(false); }
  };
  const startClient = async () => {
    setBusy(true);
    try { const p = await ensureClientProfile(user); await load(); await activate("ROLE_CLIENT"); navigate("/settings/client"); }
    catch (e) { console.error(e); } finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const activeType = user?.account_type;
  const completion = computeCompletion(freelance);
  const checks = completionChecks(freelance);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-brand-ink">Mes profils professionnels</h2>
        <p className="mt-1 text-sm text-muted-foreground">Un même compte peut être utilisé comme client <span className="font-medium">et</span> freelance. Activez les profils dont vous avez besoin.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Freelance card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-brand" /> Profil Freelance {activeType === "ROLE_FREELANCER" && <Badge className="ml-1 gap-1 bg-brand text-white"><CheckCircle2 className="h-3 w-3" /> Actif</Badge>}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {freelance ? (
              <>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-brand-ink">{freelance.headline || "Titre non défini"}</p>
                  <p className="text-muted-foreground">📍 {freelance.country || "—"}{freelance.city ? ` · ${freelance.city}` : ""}</p>
                  {freelance.hourly_rate != null && <p className="text-muted-foreground">Tarif : {freelance.hourly_rate} {freelance.currency}/h</p>}
                  <p className="text-muted-foreground">Disponibilité : {AVAILABILITY_STATUS.find((a) => a.value === freelance.availability_status)?.label || "—"} · {COMMITMENTS.find((c) => c.value === freelance.availability_commitment)?.label || "—"}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Complétude</span><span>{completion}%</span></div>
                  <Progress value={completion} className="mt-1 h-2" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate("/settings/freelancer")}><Pencil className="mr-1 h-3.5 w-3.5" /> Modifier</Button>
                  {activeType !== "ROLE_FREELANCER" && <Button size="sm" variant="outline" onClick={() => activate("ROLE_FREELANCER")} disabled={busy}><Power className="mr-1 h-3.5 w-3.5" /> Activer</Button>}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Pas encore de profil freelance. Proposez vos services et postulez à des missions.</p>
                <Button size="sm" variant="outline" onClick={startFreelance} disabled={busy}><Plus className="mr-1 h-4 w-4" /> Créer mon profil freelance</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand" /> Profil Client {activeType === "ROLE_CLIENT" && <Badge className="ml-1 gap-1 bg-brand text-white"><CheckCircle2 className="h-3 w-3" /> Actif</Badge>}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client ? (
              <>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-brand-ink">{client.display_name} <Badge variant="outline" className="ml-1">{client.kind === "company" ? "Entreprise" : "Particulier"}</Badge></p>
                  <p className="text-muted-foreground">📍 {client.country || "—"}</p>
                  {client.description && <p className="text-muted-foreground">{client.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate("/settings/client")}><Pencil className="mr-1 h-3.5 w-3.5" /> Modifier</Button>
                  {activeType !== "ROLE_CLIENT" && <Button size="sm" variant="outline" onClick={() => activate("ROLE_CLIENT")} disabled={busy}><Power className="mr-1 h-3.5 w-3.5" /> Activer</Button>}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Pas encore de profil client. Publiez des projets et recrutez des freelances.</p>
                <Button size="sm" variant="outline" onClick={startClient} disabled={busy}><Plus className="mr-1 h-4 w-4" /> Créer mon profil client</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion checklist */}
      {freelance && (
        <Card>
          <CardHeader><CardTitle>Complétez votre profil freelance</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Profil complété à {completion}%</span><span className="text-brand-ink">Complétez pour booster votre visibilité</span></div>
            <Progress value={completion} className="mb-4 h-2.5" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  {c.done ? <CheckCircle2 className="h-4 w-4 text-brand" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                  <span className={c.done ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </div>
              ))}
            </div>
            <Button className="mt-4 bg-brand hover:bg-brand-dark" size="sm" onClick={() => navigate("/settings/freelancer")}>Compléter mon profil</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
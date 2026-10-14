import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Clock, Users, CheckCircle2, Paperclip, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Rating from "@/components/Rating";
import { Image } from "@/components/ui/image";
import { formatMoney } from "@/lib/mockData";
import { fetchProject } from "@/lib/projectView";
import { fetchProposals } from "@/lib/proposalView";
import { fetchFreelancers, matchFreelancersToProject } from "@/lib/freelancerView";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import AuthGateModal from "@/components/AuthGateModal";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [loadingP, setLoadingP] = useState(true);
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [delay, setDelay] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [matches, setMatches] = useState([]);
  const [gateOpen, setGateOpen] = useState(false);

  const loadProposals = async () => setProposals(await fetchProposals(id));

  useEffect(() => {
    let alive = true;
    (async () => {
      const rec = await fetchProject(id);
      if (!alive) return;
      setP(rec);
      setLoadingP(false);
      loadProposals();
      const fls = await fetchFreelancers({ limit: 50 });
      if (alive && rec) setMatches(matchFreelancersToProject(rec, fls));
    })();
    return () => { alive = false; };
  }, [id]);

  const isOwner = !!(user && p?._real && p.owner_id === user.id);

  if (loadingP) return <div className="grid place-items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (!p) {
    return <div className="grid place-items-center py-32 text-center"><p className="text-muted-foreground">Projet introuvable.</p><Button className="mt-4" variant="outline" onClick={() => navigate("/projects")}>Retour</Button></div>;
  }

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.entities.Proposal.create({
        project_id: id,
        project_title: p.title,
        freelancer_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "Freelance"),
        price: price ? Number(price) : null,
        delay_days: delay ? Number(delay) : null,
        message: message || "",
        status: "pending",
      });
      await loadProposals();
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); navigate("/dashboard/freelancer"); }, 1200);
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/projects" className="text-sm text-muted-foreground hover:text-brand">← Retour aux missions</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap gap-2">{(p.skills || []).map((s, i) => <Badge key={i} variant="secondary">{String(s)}</Badge>)}</div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-ink">{p.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location?.flag} {p.location?.city}</span>
            {p.deadline && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Deadline : {p.deadline}</span>}
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {proposals.length} propositions</span>
            {p.postedDate && <span>Publié le {p.postedDate}</span>}
          </div>

          <Card className="mt-6 p-6">
            <h2 className="font-semibold">Description</h2>
            <p className="mt-2 leading-relaxed text-foreground/80">{p.description}</p>
            {p.objectives && <><h2 className="mt-5 font-semibold">Objectifs</h2><p className="mt-2 text-foreground/80">{p.objectives}</p></>}
            {p.deliverables && <><h2 className="mt-5 font-semibold">Livrables</h2><p className="mt-2 text-foreground/80">{p.deliverables}</p></>}
          </Card>

          {isOwner && (
            <Card className="mt-6 p-6">
              <h2 className="font-semibold">Propositions reçues ({proposals.length})</h2>
              {proposals.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Aucune candidature pour l'instant.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {proposals.map((pr) => (
                    <div key={pr.id} className="rounded-xl border border-border/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-brand-ink">{pr.freelancer_name}</p>
                          <p className="text-xs text-muted-foreground">{pr.created_date ? new Date(pr.created_date).toLocaleDateString("fr-FR") : ""}</p>
                        </div>
                        <Badge variant={pr.status === "accepted" ? "default" : pr.status === "rejected" ? "destructive" : "secondary"}>
                          {pr.status === "accepted" ? "Acceptée" : pr.status === "rejected" ? "Refusée" : "En attente"}
                        </Badge>
                      </div>
                      {pr.price != null && <p className="mt-2 text-sm"><span className="text-muted-foreground">Prix : </span>{formatMoney(pr.price)}</p>}
                      {pr.delay_days != null && <p className="text-sm"><span className="text-muted-foreground">Délai : </span>{pr.delay_days} jours</p>}
                      {pr.message && <p className="mt-2 text-sm text-foreground/80">{pr.message}</p>}
                      {pr.status === "pending" && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="bg-brand hover:bg-brand-dark" onClick={async () => {
                            await api.entities.Proposal.update(pr.id, { status: "accepted" });
                            try {
                              await api.entities.Contract.create({
                                project_id: id,
                                project_title: p.title,
                                client_name: p.clientName,
                                client_id: p.owner_id,
                                freelancer_name: pr.freelancer_name,
                                freelancer_id: pr.created_by_id,
                                price: pr.price,
                                delay_days: pr.delay_days,
                                status: "active",
                              });
                            } catch { /* contract may already exist */ }
                            loadProposals();
                          }}>Accepter</Button>
                          <Button size="sm" variant="outline" onClick={async () => { await api.entities.Proposal.update(pr.id, { status: "rejected" }); loadProposals(); }}>Refuser</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {matches.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-gold" /><h2 className="font-display text-xl font-bold text-brand-ink">Freelances recommandés</h2></div>
              <p className="mt-1 text-sm text-muted-foreground">Matching basé sur les compétences du projet.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {matches.map((m) => (
                  <Card key={m.freelancer.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image src={m.freelancer.avatar} fittingType="fill" className="h-9 w-9 rounded-full" alt="" />
                        <div><p className="text-sm font-semibold">{m.freelancer.name}</p><p className="text-xs text-muted-foreground">{m.freelancer.title}</p></div>
                      </div>
                      <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">{m.score}% match</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {m.reasons.slice(0, 4).map((r, i) => <span key={i} className="inline-flex items-center gap-1 text-xs text-brand"><CheckCircle2 className="h-3 w-3" /> {r}</span>)}
                    </div>
                    <Link to={`/freelancers/${m.freelancer.id}`} className="mt-3 block text-center text-sm font-medium text-brand hover:underline">Voir le profil</Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget</p>
            <p className="mt-1 font-display text-2xl font-bold text-brand-ink">
              {p.budgetType === "fixed" ? `${formatMoney(p.budgetMin)} – ${formatMoney(p.budgetMax)}` : `${formatMoney(p.budgetMin)}/mois`}
            </p>
            <p className="text-xs text-muted-foreground">{p.budgetType === "fixed" ? "Budget fixe" : "Tarif mensuel"}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{p.contractType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Niveau</span><span>{p.experienceLevel}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Candidatures</span><span>{proposals.length}</span></div>
            </div>
            {user ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button className="mt-5 w-full bg-brand hover:bg-brand-dark">Postuler</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Postuler à ce projet</DialogTitle></DialogHeader>
                  {submitted ? (
                    <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-brand" /><p className="mt-3 font-medium">Candidature envoyée !</p></div>
                  ) : (
                    <div className="space-y-4">
                      <div><Label>Votre proposition (FCFA)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="700000" /></div>
                      <div><Label>Délai estimé (jours)</Label><Input type="number" value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="30" /></div>
                      <div><Label>Message de candidature</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Expliquez pourquoi vous êtes le talent idéal..." /></div>
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground"><Paperclip className="h-4 w-4" /> Ajouter une pièce jointe (CV, portfolio)</div>
                      <Button className="w-full bg-brand hover:bg-brand-dark" onClick={submit} disabled={submitting}>{submitting ? "Envoi…" : <><Send className="mr-2 h-4 w-4" /> Envoyer ma candidature</>}</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <Button className="mt-5 w-full bg-brand hover:bg-brand-dark" onClick={() => setGateOpen(true)}>Postuler</Button>
            )}
            <AuthGateModal open={gateOpen} onOpenChange={setGateOpen} title="Créez votre profil freelance" message="Inscrivez-vous gratuitement pour envoyer votre candidature à ce projet et accéder aux missions." />
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Client</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-ink text-sm font-bold text-white">{(p.clientName || "?")[0]}</div>
              <div><p className="font-semibold">{p.clientName}</p><Rating value={p.clientRating} size={12} /></div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
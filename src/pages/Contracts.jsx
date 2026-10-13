import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatMoney, COMMISSION_RATE } from "@/lib/mockData";
import { useAuth } from "@/lib/AuthContext";
import { fetchContractsForUser } from "@/lib/contractView";

const statusColor = { Draft: "secondary", Pending: "secondary", Active: "default", Completed: "secondary", Cancelled: "destructive", Disputed: "destructive" };

export default function Contracts() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchContractsForUser(user?.id).then((r) => { if (alive) { setAll(r); setLoading(false); } });
    return () => { alive = false; };
  }, [user?.id]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-brand-ink">Contrats</h1>
      <p className="text-muted-foreground">Suivez vos missions et leurs statuts.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des contrats…</div>
      ) : all.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">Aucun contrat pour le moment.</div>
      ) : (
        <Tabs defaultValue="active" className="mt-6">
          <TabsList>
            <TabsTrigger value="active">Actifs</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="disputed">Litiges</TabsTrigger>
          </TabsList>

          {[
            { key: "active", filter: "Active" },
            { key: "completed", filter: "Completed" },
            { key: "pending", filter: "Pending" },
            { key: "disputed", filter: "Disputed" },
          ].map((t) => (
            <TabsContent key={t.key} value={t.key} className="mt-4 space-y-3">
              {all.filter((c) => c.status === t.filter).map((c) => {
                const commission = Math.round((c.amount || 0) * COMMISSION_RATE);
                return (
                  <Card key={c.id} className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand"><FileText className="h-5 w-5" /></div>
                        <div>
                          <Link to={`/projects/${c.projectId}`} className="font-medium hover:text-brand">{c.title || "Projet"}</Link>
                          <p className="text-xs text-muted-foreground">Avec {c.freelancerName || "Freelance"} · {c.type}</p>
                          {c.startDate && <p className="text-xs text-muted-foreground">{c.startDate}{c.endDate ? ` → ${c.endDate}` : ""}</p>}</div>
                        </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatMoney(c.amount || 0)}</p>
                          <p className="text-xs text-muted-foreground">Commission {formatMoney(commission)}</p>
                          {c.freelancerId && (
                            <Link to={`/messages?to=${c.freelancerId}&name=${encodeURIComponent(c.freelancerName || "")}&project=${encodeURIComponent(c.title || "")}`} className="text-xs text-brand hover:underline">Contacter le freelance</Link>
                          )}
                        </div>
                        <Badge variant={statusColor[c.status] || "secondary"}>{c.status}</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {all.filter((c) => c.status === t.filter).length === 0 && <p className="py-8 text-center text-muted-foreground">Aucun contrat dans cette catégorie.</p>}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
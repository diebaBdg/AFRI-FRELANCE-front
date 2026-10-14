import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Smartphone, Loader2 } from "lucide-react";
import { money } from "@/lib/profiles";

const POSITIVE = ["deposit", "earning", "refund", "escrow_out"];
const TYPE_LABEL = { deposit: "Dépôt", withdraw: "Retrait", escrow_in: "Bloqué (escrow)", escrow_out: "Libéré (escrow)", earning: "Revenu", refund: "Remboursement", fee: "Frais" };
const METHODS = [{ name: "Wave", color: "bg-blue-50 text-blue-600" }, { name: "Orange Money", color: "bg-orange-50 text-orange-600" }];

export default function Wallet() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) { setLoading(false); return; }
      const list = await api.entities.WalletTransaction.filter({ user_id: user.id }).catch(() => []);
      if (!alive) return;
      setTxns(Array.isArray(list) ? list : []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const currency = txns[0]?.currency || "XOF";
  const balance = txns.reduce((s, t) => s + (POSITIVE.includes(t.type) ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
  const pending = txns.filter((t) => t.status === "pending").reduce((s, t) => s + (POSITIVE.includes(t.type) ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
  const totalIn = txns.filter((t) => POSITIVE.includes(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalOut = txns.filter((t) => !POSITIVE.includes(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-brand-ink">Wallet</h1>
      <p className="text-muted-foreground">Paiements Wave et Orange Money liés à vos contrats.</p>

      <Card className="mt-6 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-ink to-brand p-6 text-white">
          <div className="flex items-center gap-2"><WalletIcon className="h-5 w-5" /><span className="text-sm text-white/70">Solde estimé</span></div>
          <p className="mt-2 font-display text-4xl font-bold">{money(balance, currency)}</p>
          <p className="mt-1 text-sm text-white/60">En attente : {money(pending, currency)}</p>
          <Button asChild className="mt-5 bg-white text-brand-ink hover:bg-white/90">
            <Link to="/contracts">Payer un contrat</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Total crédité</p><p className="font-semibold text-brand">{money(totalIn, currency)}</p></div>
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Total débité</p><p className="font-semibold">{money(totalOut, currency)}</p></div>
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Transactions</p><p className="font-semibold">{txns.length}</p></div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {METHODS.map((m) => (
          <Card key={m.name} className="flex items-center gap-3 p-4">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${m.color}`}><Smartphone className="h-5 w-5" /></div>
            <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">Escrow contrat</p></div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList><TabsTrigger value="all">Toutes</TabsTrigger><TabsTrigger value="in">Entrées</TabsTrigger><TabsTrigger value="out">Sorties</TabsTrigger></TabsList>
        {[
          ["all", txns],
          ["in", txns.filter((t) => POSITIVE.includes(t.type))],
          ["out", txns.filter((t) => !POSITIVE.includes(t.type))],
        ].map(([val, list]) => (
          <TabsContent key={val} value={val} className="mt-4 space-y-2">
            {loading ? <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
              : list.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucune transaction.</div>
              : list.map((t) => {
                const inc = POSITIVE.includes(t.type);
                return (
                  <Card key={t.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-full ${inc ? "bg-brand-light text-brand" : "bg-muted text-muted-foreground"}`}>{inc ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}</div>
                      <div>
                        <p className="text-sm font-medium">{t.description || TYPE_LABEL[t.type]}</p>
                        <p className="text-xs text-muted-foreground">{TYPE_LABEL[t.type] || t.type} · {t.created_date ? new Date(t.created_date).toLocaleDateString("fr-FR") : ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${inc ? "text-brand" : ""}`}>{inc ? "+" : "−"}{money(t.amount, t.currency)}</p>
                      <Badge variant={t.status === "completed" ? "default" : "secondary"} className="mt-1">{t.status === "completed" ? "Traité" : t.status}</Badge>
                      {t.checkoutUrl && (
                        <a href={t.checkoutUrl} className="mt-1 block text-xs text-primary hover:underline" target="_blank" rel="noreferrer">Ouvrir le paiement</a>
                      )}
                    </div>
                  </Card>
                );
              })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

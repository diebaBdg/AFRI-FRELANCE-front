import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Smartphone, Loader2, Plus, Download } from "lucide-react";
import { money } from "@/lib/profiles";

const POSITIVE = ["deposit", "earning", "refund", "escrow_out"];
const TYPE_LABEL = { deposit: "Dépôt", withdraw: "Retrait", escrow_in: "Bloqué (escrow)", escrow_out: "Libéré (escrow)", earning: "Revenu", refund: "Remboursement", fee: "Frais" };
const METHODS = [{ name: "Wave", color: "bg-blue-50 text-blue-600" }, { name: "Orange Money", color: "bg-orange-50 text-orange-600" }, { name: "Carte bancaire", color: "bg-purple-50 text-purple-600" }, { name: "Virement", color: "bg-emerald-50 text-emerald-600" }];

export default function Wallet() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [opType, setOpType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Wave");

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const list = await base44.entities.WalletTransaction.filter({ user_id: user.id }, "-created_date", 100).catch(() => []);
    setTxns(Array.isArray(list) ? list : []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const balance = txns.reduce((s, t) => s + (POSITIVE.includes(t.type) ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
  const pending = txns.filter((t) => t.status === "pending").reduce((s, t) => s + (POSITIVE.includes(t.type) ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
  const totalIn = txns.filter((t) => POSITIVE.includes(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalOut = txns.filter((t) => !POSITIVE.includes(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Montant invalide."); return; }
    if (opType === "withdraw" && amt > balance) { setError("Solde insuffisant."); return; }
    setSaving(true); setError("");
    try {
      const newBal = opType === "deposit" ? balance + amt : balance - amt;
      await base44.entities.WalletTransaction.create({
        user_id: user.id, type: opType, amount: amt, currency: "USD", status: "completed",
        description: `${TYPE_LABEL[opType]} via ${method}`, balance_after: newBal,
      });
      setAmount(""); setOpen(false); await load();
    } catch (err) { setError(err.message || "Échec de l'opération"); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-brand-ink">Wallet</h1>
      <p className="text-muted-foreground">Vos revenus, dépôts, retraits et transactions (POC simulé).</p>

      <Card className="mt-6 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-ink to-brand p-6 text-white">
          <div className="flex items-center gap-2"><WalletIcon className="h-5 w-5" /><span className="text-sm text-white/70">Solde disponible</span></div>
          <p className="mt-2 font-display text-4xl font-bold">{money(balance, "USD")}</p>
          <p className="mt-1 text-sm text-white/60">En attente : {money(pending, "USD")}</p>
          <div className="mt-5 flex gap-2">
            <Button className="bg-white text-brand-ink hover:bg-white/90" onClick={() => { setOpType("deposit"); setOpen(true); }}><Plus className="h-4 w-4" /> Déposer</Button>
            <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => { setOpType("withdraw"); setOpen(true); }}><ArrowUpRight className="h-4 w-4" /> Retirer</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Total crédité</p><p className="font-semibold text-brand">{money(totalIn, "USD")}</p></div>
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Total débité</p><p className="font-semibold">{money(totalOut, "USD")}</p></div>
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Transactions</p><p className="font-semibold">{txns.length}</p></div>
        </div>
      </Card>

      {/* Modal content */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{opType === "deposit" ? "Déposer des fonds" : "Retirer des fonds"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Montant (USD)</Label><Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" /></div>
            <div className="space-y-1.5"><Label>Méthode</Label><select value={method} onChange={(e) => setMethod(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">{METHODS.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
            <p className="text-sm text-muted-foreground">Solde actuel : {money(balance, "USD")}</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <DialogClose asChild><Button variant="ghost">Annuler</Button></DialogClose>
              <Button onClick={submit} disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />…</> : "Confirmer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Methods */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {METHODS.map((m) => (
          <Card key={m.name} className="flex items-center gap-3 p-4">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${m.color}`}><Smartphone className="h-5 w-5" /></div>
            <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">Simulé</p></div>
          </Card>
        ))}
      </div>

      {/* Transactions */}
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
                      <div><p className="text-sm font-medium">{t.description || TYPE_LABEL[t.type]}</p><p className="text-xs text-muted-foreground">{TYPE_LABEL[t.type]} · {t.created_date ? new Date(t.created_date).toLocaleDateString("fr-FR") : ""}</p></div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${inc ? "text-brand" : ""}`}>{inc ? "+" : "−"}{money(t.amount, t.currency)}</p>
                      <Badge variant={t.status === "completed" ? "default" : "secondary"} className="mt-1">{t.status === "completed" ? "Reçu" : t.status}</Badge>
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
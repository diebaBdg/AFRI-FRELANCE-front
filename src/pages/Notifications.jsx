import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Briefcase, MessageSquare, DollarSign, Star, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { fetchNotifications, markAllNotificationsRead } from "@/lib/notificationsView";

const iconMap = { proposal: Briefcase, message: MessageSquare, payment: DollarSign, match: Star, review: Star };

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchNotifications().then((r) => { if (alive) { setItems(r); setLoading(false); } });
    return () => { alive = false; };
  }, [user?.id]);

  const markAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    setItems((p) => p.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Bell className="h-6 w-6 text-brand" /><h1 className="font-display text-2xl font-bold text-brand-ink">Notifications</h1></div>
        <Button variant="outline" size="sm" onClick={markAll} disabled={items.length === 0}>Tout marquer lu</Button>
      </div>
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement…</div>
        ) : items.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">Aucune notification pour le moment.</Card>
        ) : items.map((n) => {
          const Icon = iconMap[n.type] || Bell;
          const content = (
            <Card className={`flex items-start gap-3 p-4 ${n.unread ? "border-brand/30 bg-brand-light/30" : ""}`}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-light text-brand"><Icon className="h-5 w-5" /></div>
              <div className="flex-1"><p className="text-sm font-medium">{n.title}</p><p className="text-sm text-muted-foreground">{n.text}</p>{n.time && <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>}</div>
              {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
            </Card>
          );
          return n.link ? <Link key={n.id} to={n.link} className="block">{content}</Link> : <div key={n.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
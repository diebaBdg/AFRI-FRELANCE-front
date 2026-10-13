import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/mockData";

export default function ProjectCard({ project: p }) {
  if (!p) return null;
  return (
    <Card className="group flex flex-col border-border/60 p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(p.skills || []).slice(0, 3).map((s, i) => (
            <Badge key={i} variant="secondary" className="font-normal">{String(s)}</Badge>
          ))}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{p.proposals != null ? `${p.proposals} prop.` : "—"}</span>
      </div>

      <Link to={`/projects/${p.id}`} className="mt-3 block">
        <h3 className="font-semibold leading-snug text-foreground group-hover:text-brand">{p.title}</h3>
      </Link>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span>{p.location?.flag}</span> {p.location?.city}</span>
        {p.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.deadline}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="font-semibold text-foreground">
            {p.budgetType === "fixed"
              ? `${formatMoney(p.budgetMin)} – ${formatMoney(p.budgetMax)}`
              : `${formatMoney(p.budgetMin)} / mois`}
          </p>
        </div>
        <Link
          to={`/projects/${p.id}`}
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-light hover:text-brand"
        >
          Voir le projet
        </Link>
      </div>
    </Card>
  );
}
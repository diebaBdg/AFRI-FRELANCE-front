import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES, formatMoney } from "@/lib/mockData";

function flag(country) {
  return COUNTRIES.find((c) => c.name === country || c.code === country)?.flag || "🌍";
}

function budgetLabel(p) {
  const cur = p.currency || "USD";
  if (p.budget_min && p.budget_max) return `${formatMoney(p.budget_min, cur)} – ${formatMoney(p.budget_max, cur)}`;
  if (p.budget_min) return `À partir de ${formatMoney(p.budget_min, cur)}`;
  return "Budget à définir";
}

export default function FindMission({ projects = [], loading = false }) {
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">
            Votre prochaine opportunité est peut‑être ici
          </h2>
          <p className="mt-2 text-muted-foreground">Découvrez des projets qui correspondent à vos compétences.</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-white" />
            ))
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun projet publié pour le moment.</p>
          ) : (
            projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="group flex flex-col rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
              >
                <h3 className="font-display text-lg font-semibold text-brand-ink group-hover:text-brand">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(p.skills || []).slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-border pt-3 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {flag(p.country)} {p.country || "—"}
                  </span>
                  <span className="font-semibold text-brand">{budgetLabel(p)}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-10 text-center">
          <Button className="bg-brand hover:bg-brand-dark" asChild>
            <Link to="/projects">Voir toutes les missions <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
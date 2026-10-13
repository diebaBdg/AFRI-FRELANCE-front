import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FreelancerCard from "@/components/FreelancerCard";

export default function TopFreelancers({ freelancers = [], loading = false }) {
  return (
    <section className="border-b border-border py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">Top Freelancers</h2>
            <p className="mt-2 text-muted-foreground">Une sélection de profils vérifiés, prêts à travailler.</p>
          </div>
          <Link to="/freelancers" className="hidden items-center gap-1 text-sm font-medium text-brand hover:underline sm:flex">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-muted/50" />
              ))
            : freelancers.length === 0
            ? <p className="text-sm text-muted-foreground">Aucun talent pour le moment.</p>
            : freelancers.map((f) => <FreelancerCard key={f.id} freelancer={f} />)}
        </div>
      </div>
    </section>
  );
}
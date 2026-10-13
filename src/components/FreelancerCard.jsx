import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { TopFreelancerBadge } from "@/components/VerifiedBadges";
import { money } from "@/lib/profiles";

export default function FreelancerCard({ freelancer: f }) {
  if (!f) return null;
  return (
    <Card className="group relative overflow-hidden border-border/60 p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl">
      {f.topFreelancer && (
        <div className="absolute right-4 top-4">
          <TopFreelancerBadge />
        </div>
      )}
      <div className="flex items-start gap-4">
        <Link to={`/freelancers/${f.id}`}>
          <Image src={f.avatar} alt={f.name} fittingType="fill" className="h-14 w-14 rounded-2xl ring-2 ring-border" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/freelancers/${f.id}`} className="block">
            <h3 className="truncate font-semibold text-foreground group-hover:text-brand">{f.name}</h3>
          </Link>
          <p className="truncate text-sm text-muted-foreground">{f.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <span>{f.flag}</span> {[f.city, f.country].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm">
        {f.rating > 0 ? (
          <><Star className="h-4 w-4 fill-brand-gold text-brand-gold" /><span className="font-semibold">{f.rating}</span><span className="text-xs text-muted-foreground">({f.reviews})</span></>
        ) : (
          <Badge variant="secondary" className="font-normal">Nouveau talent</Badge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(f.skills || []).slice(0, 4).map((s, i) => (
          <Badge key={i} variant="secondary" className="font-normal">{String(s)}</Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">À partir de</p>
          <p className="font-semibold text-foreground">{money(f.rate || 0, f.currency || "USD")}/h</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${f.available ? "text-brand" : "text-muted-foreground"}`}>
          <span className={`h-2 w-2 rounded-full ${f.available ? "bg-brand" : "bg-muted-foreground/40"}`} />
          {f.available ? "Disponible" : "Occupé"}
        </span>
      </div>

      <Link
        to={`/freelancers/${f.id}`}
        className="mt-4 block rounded-xl border border-border bg-white py-2 text-center text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-light hover:text-brand"
      >
        Voir le profil
      </Link>
    </Card>
  );
}
import { Badge } from "@/components/ui/badge";

const stats = [
  { value: "10K+", label: "Talents" },
  { value: "2K+", label: "Entreprises" },
  { value: "5K+", label: "Projets" },
  { value: "15+", label: "Pays" },
];

export default function SocialProof() {
  return (
    <section className="border-b border-border bg-white">
      <p className="mx-auto max-w-2xl px-4 pt-12 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground sm:px-6">
        Des talents et entreprises déjà connectés à travers l’Afrique et le monde
      </p>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-bold text-brand-ink sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center pb-10">
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Données de démonstration — POC
        </Badge>
      </div>
    </section>
  );
}
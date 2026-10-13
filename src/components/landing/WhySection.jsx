import { Globe2, Briefcase, ShieldCheck, CreditCard, Zap, Handshake } from "lucide-react";

const reasons = [
  { icon: Globe2, title: "Talents sans frontières", text: "Accédez à des talents africains où que vous soyez." },
  { icon: Briefcase, title: "Des opportunités pour tous", text: "Trouvez des missions locales et internationales." },
  { icon: ShieldCheck, title: "Des profils de confiance", text: "Profils, avis et badges de vérification." },
  { icon: CreditCard, title: "Des paiements adaptés", text: "Préparez les paiements locaux et internationaux." },
  { icon: Zap, title: "Simple et rapide", text: "Publiez, échangez et recrutez en quelques étapes." },
  { icon: Handshake, title: "Une communauté pro", text: "Construisez votre réputation au fil des projets." },
];

export default function WhySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">
          Une marketplace pensée pour le monde du travail africain
        </h2>
        <p className="mt-2 text-muted-foreground">Pourquoi choisir AfriFreelance.</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl border border-border/60 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-light text-brand">
              <r.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-brand-ink">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
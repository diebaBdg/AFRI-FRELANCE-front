import { Star } from "lucide-react";

const items = [
  {
    quote: "J’ai trouvé un développeur sénégalais parfaitement adapté à notre projet en quelques jours.",
    who: "Client",
    where: "Paris, France",
  },
  {
    quote: "En tant que designer à Abidjan, j’ai décroché des missions avec des clients européens. Mon marché s’est élargi.",
    who: "Freelance",
    where: "Abidjan, Côte d’Ivoire",
  },
  {
    quote: "Les profils vérifiés et le système de paiement nous ont donné confiance pour recruter à distance.",
    who: "Entreprise",
    where: "Dakar, Sénégal",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">
          Ils construisent avec AfriFreelance
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">Témoignages de démonstration — POC</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-border bg-white p-6">
            <div className="flex gap-0.5 text-brand">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 flex-1 text-sm text-foreground/80">“{t.quote}”</p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-semibold text-brand-ink">{t.who}</p>
              <p className="text-xs text-muted-foreground">{t.where}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
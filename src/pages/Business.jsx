import { useNavigate } from "react-router-dom";
import { Search, Users, Sparkles, FileText, Wallet, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  { icon: Search, title: "Sourcing", text: "Accédez à un vivier de talents africains vérifiés." },
  { icon: Users, title: "Recrutement freelance", text: "Comparez profils, notes et disponibilités." },
  { icon: FileText, title: "Projets & équipes", text: "Publiez un besoin ou construisez une équipe." },
  { icon: Sparkles, title: "Matching", text: "Des profils pertinents suggérés pour vos besoins." },
  { icon: FileText, title: "Contrats", text: "Cadrez chaque mission avec un contrat clair." },
  { icon: Wallet, title: "Paiements", text: "Payez en toute sécurité, sans frontières." },
];

export default function Business() {
  const navigate = useNavigate();
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-ink py-20 text-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-gold">Pour les entreprises</span>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">Accédez aux meilleurs talents africains</h1>
          <p className="mt-5 text-white/60">Trouvez rapidement les compétences dont votre entreprise a besoin — développement, design, marketing, data — sans frontières.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full bg-brand hover:bg-brand-dark sm:w-auto" onClick={() => navigate("/post-project")}>Publier un projet</Button>
            <Button size="lg" variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto" onClick={() => navigate("/freelancers")}>Voir les talents</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border/60 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-light text-brand"><p.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-display text-lg font-semibold text-brand-ink">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">Construisez votre équipe à la demande</h2>
          <p className="mt-4 text-muted-foreground">Du sourcing au paiement, gérez tout depuis une seule plateforme.</p>
          <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
            {["Développez votre équipe", "Publiez vos projets", "Comparez les profils", "Recevez des propositions", "Collaborez", "Gérez vos contrats"].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white"><Check className="h-3 w-3" /></span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button className="bg-brand hover:bg-brand-dark" onClick={() => navigate("/post-project")}>Publier un projet <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
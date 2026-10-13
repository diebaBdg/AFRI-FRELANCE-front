import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const bullets = [
  "Développez votre équipe",
  "Publiez vos projets",
  "Comparez les profils",
  "Recevez des propositions",
  "Collaborez",
  "Gérez vos contrats",
];

export default function BusinessSection() {
  const navigate = useNavigate();
  return (
    <section id="enterprise" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
            Pour les entreprises
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-ink">
            Construisez votre équipe à la demande
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trouvez rapidement les compétences dont votre entreprise a besoin, sans frontières.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Check className="h-3 w-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="bg-brand hover:bg-brand-dark" onClick={() => navigate("/post-project")}>
              Publier un projet
            </Button>
            <Button variant="outline" onClick={() => navigate("/freelancers")}>Trouver un freelance</Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-brand-ink p-8 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/30 blur-2xl" />
          <p className="relative text-sm font-medium text-white/60">Recrutement freelance · Afrique → Monde</p>
          <h3 className="relative mt-2 font-display text-xl font-bold">Le bon talent, au bon moment</h3>
          <div className="relative mt-6 space-y-3">
            {["Sourcing de talents", "Profils vérifiés", "Contrats & paiements intégrés"].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm">{t}</span>
                <span className="text-xs font-semibold text-brand">Inclus</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
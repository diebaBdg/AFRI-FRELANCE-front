import { useNavigate } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const freelanceSteps = [
  "Créez votre profil",
  "Présentez vos compétences",
  "Trouvez les bons projets",
  "Envoyez vos propositions",
  "Travaillez et développez votre réputation",
];
const clientSteps = [
  "Publiez votre projet",
  "Recevez des propositions",
  "Choisissez votre talent",
  "Collaborez",
  "Payez en toute sécurité",
];

function Steps({ items, dark }) {
  return (
    <ol className="mt-6 space-y-4">
      {items.map((t, i) => (
        <li key={t} className="flex items-center gap-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
          <p className={dark ? "font-medium" : "font-medium text-foreground"}>{t}</p>
        </li>
      ))}
    </ol>
  );
}

export default function Journeys() {
  const navigate = useNavigate();
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">Comment ça marche</h2>
        <p className="mt-2 text-muted-foreground">Deux parcours simples, une même plateforme.</p>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand"><Users className="h-5 w-5" /></div>
            <h3 className="font-display text-xl font-bold text-brand-ink">Je suis freelance</h3>
          </div>
          <Steps items={freelanceSteps} />
          <Button className="mt-7 w-full bg-brand hover:bg-brand-dark" onClick={() => navigate("/register")}>
            Commencer comme freelance
          </Button>
        </div>
        <div className="rounded-3xl border border-border bg-brand-ink p-7 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brand-gold"><Briefcase className="h-5 w-5" /></div>
            <h3 className="font-display text-xl font-bold">Je suis client</h3>
          </div>
          <Steps items={clientSteps} dark />
          <Button className="mt-7 w-full bg-white text-brand-ink hover:bg-white/90" onClick={() => navigate("/post-project")}>
            Publier un projet
          </Button>
        </div>
      </div>
    </section>
  );
}
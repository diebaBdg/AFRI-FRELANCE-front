import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Wallet, FileText, Star, ShieldCheck, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const freelanceSteps = [
  "Créez votre profil et mettez en avant vos compétences",
  "Trouvez des projets qui vous correspondent",
  "Envoyez vos propositions avec prix et délai",
  "Collaborez via la messagerie intégrée",
  "Recevez votre paiement en toute sécurité",
];
const clientSteps = [
  "Publiez votre projet et votre budget",
  "Recevez des propositions de talents",
  "Comparez profils, notes et avis",
  "Choisissez votre talent et collaborez",
  "Payez en toute sécurité à la fin de la mission",
];
const features = [
  { icon: Wallet, title: "Paiements", text: "Dépôts, retraits et historique transparent dans votre portefeuille." },
  { icon: FileText, title: "Contrats", text: "Suivez chaque mission avec un contrat clair et un statut en temps réel." },
  { icon: Star, title: "Avis", text: "Construisez votre réputation grâce aux avis clients vérifiés." },
  { icon: ShieldCheck, title: "Sécurité", text: "Profils vérifiés et données protégées pour collaborer en confiance." },
  { icon: Scale, title: "Litiges", text: "Un cadre clair pour résoudre les désaccords en toute impartialité." },
];

function StepsCard({ steps, title, icon, dark, cta }) {
  const navigate = useNavigate();
  return (
    <div className={`rounded-3xl border p-7 ${dark ? "border-brand bg-brand-ink text-white" : "border-border bg-white"}`}>
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? "bg-white/10 text-brand-gold" : "bg-brand-light text-brand"}`}>{icon}</div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
      </div>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
            <p className={dark ? "text-sm text-white/80" : "text-sm text-foreground/80"}>{s}</p>
          </li>
        ))}
      </ol>
      <Button
        className={`mt-7 w-full ${dark ? "bg-white text-brand-ink hover:bg-white/90" : "bg-brand hover:bg-brand-dark"}`}
        onClick={() => navigate(cta)}
      >
        {cta === "/post-project" ? "Publier un projet" : "Commencer"}
      </Button>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">Comment ça marche ?</h1>
        <p className="mt-3 text-muted-foreground">Deux parcours simples, une même plateforme — pensée pour les talents africains et les entreprises du monde.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <StepsCard steps={freelanceSteps} title="Je suis freelance" icon={<Users className="h-5 w-5" />} cta="/register" />
        <StepsCard steps={clientSteps} title="Je suis client" icon={<Briefcase className="h-5 w-5" />} dark cta="/post-project" />
      </div>

      <h2 className="mt-16 text-center font-display text-2xl font-bold text-brand-ink">Tout ce dont vous avez besoin</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border/60 bg-white p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-light text-brand"><f.icon className="h-5 w-5" /></div>
            <h3 className="mt-4 font-display text-lg font-semibold text-brand-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl bg-brand px-6 py-12 text-center text-white sm:flex-row sm:px-16">
        <p className="font-display text-xl font-bold">Prêt à commencer ?</p>
        <Button className="bg-white text-brand-ink hover:bg-white/90" onClick={() => (window.location.href = "/register")}>Créer un compte</Button>
      </div>
    </div>
  );
}
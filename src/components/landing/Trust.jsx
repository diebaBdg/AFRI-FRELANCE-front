import { Mail, Phone, BadgeCheck, Award, Star, History } from "lucide-react";

const items = [
  { icon: Mail, label: "Email vérifié" },
  { icon: Phone, label: "Téléphone vérifié" },
  { icon: BadgeCheck, label: "Identité vérifiée" },
  { icon: Award, label: "Profil professionnel" },
  { icon: Star, label: "Avis clients" },
  { icon: History, label: "Historique des missions" },
];

export default function Trust() {
  return (
    <section className="bg-brand-ink py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold">Travailler ensemble commence par la confiance</h2>
          <p className="mt-3 text-white/60">
            AfriFreelance contribue à créer un environnement professionnel fiable, du premier contact à la fin de la mission.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((it) => (
            <div key={it.label} className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <it.icon className="h-6 w-6 text-brand" />
              <span className="text-xs text-white/80">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
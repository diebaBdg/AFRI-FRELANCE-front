import { ArrowRight } from "lucide-react";

const africa = [
  { flag: "🇸🇳", name: "Sénégal" },
  { flag: "🇨🇮", name: "Côte d’Ivoire" },
  { flag: "🇨🇲", name: "Cameroun" },
  { flag: "🇲🇦", name: "Maroc" },
  { flag: "🇳🇬", name: "Nigeria" },
  { flag: "🇰🇪", name: "Kenya" },
];
const world = [
  { flag: "🇫🇷", name: "France" },
  { flag: "🇧🇪", name: "Belgique" },
  { flag: "🇨🇭", name: "Suisse" },
  { flag: "🇨🇦", name: "Canada" },
];

function Chips({ items, accent }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((c) => (
        <div
          key={c.name}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${accent} border-white/10 bg-white/5`}
        >
          <span className="text-lg">{c.flag}</span>
          <span className="truncate text-sm text-white/80">{c.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function AfricaWorld() {
  return (
    <section className="relative overflow-hidden bg-brand-ink py-20 text-white">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Du talent africain aux opportunités mondiales
          </h2>
          <p className="mt-4 text-white/60">
            AfriFreelance crée un pont entre les talents africains, les entreprises locales et les marchés internationaux.
          </p>
        </div>
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Talents en Afrique</p>
            <Chips items={africa} accent="" />
          </div>
          <div className="hidden place-items-center lg:grid">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
              <ArrowRight className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs text-white/40">Afrique → Monde</p>
          </div>
          <div className="lg:mt-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Opportunités dans le monde</p>
            <Chips items={world} accent="" />
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-white/40">
          …et bien d’autres destinations. La plateforme n’est pas limitée à ces pays.
        </p>
      </div>
    </section>
  );
}
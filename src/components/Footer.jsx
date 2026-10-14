import { Link } from "react-router-dom";

const cols = [
  { title: "Talents", links: [["Trouver un freelance", "/freelancers"], ["Catégories", "/freelancers#categories"], ["Top Freelancers", "/freelancers"]] },
  { title: "Missions", links: [["Trouver une mission", "/projects"], ["Publier un projet", "/post-project"], ["Contrats", "/contracts"], ["Paiements", "/wallet"]] },
  { title: "Entreprises", links: [["Pour les entreprises", "/business"], ["Comment ça marche", "/how-it-works"], ["Solutions", "/freelancers"]] },
  { title: "AfriFreelance", links: [["À propos", "/"], ["Centre d’aide", "/"], ["Contact", "/"]] },
  { title: "Légal", links: [["Mentions légales", "/"], ["Confidentialité", "/"], ["CGU", "/"], ["Sécurité", "/"]] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-brand-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-1">
            <div className="inline-flex rounded-xl bg-white px-3 py-2">
              <img
                src="/logo.svg"
                alt="AfriFreelance"
                className="h-8 w-auto"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">Le talent africain rencontre le monde. 🇸🇳🌍</p>
            <p className="mt-3 text-xs text-white/30">Dakar · Paris · Abidjan</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-white">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/50 transition-colors hover:text-brand">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© 2026 AfriFreelance — Données de démonstration (POC).</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/" className="hover:text-white">Mentions légales</Link>
            <Link to="/" className="hover:text-white">Confidentialité</Link>
            <Link to="/" className="hover:text-white">CGU</Link>
            <Link to="/" className="hover:text-white">Sécurité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
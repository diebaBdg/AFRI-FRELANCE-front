import React from "react";

const FEATURES = [
  { title: "Talents vérifiés", text: "Profils africains triés sur le volet, badges d'identité et de compétences." },
  { title: "Paiements sécurisés", text: "Versement protégé, libération après validation, mobile money & cartes." },
  { title: "Matching intelligent", text: "Recommandations de missions et de talents en temps réel." },
];

const LOGO_MARK = "/logo-mark.svg";

export default function AuthSplitLayout({ tagline, title, subtitle, children, footer, accent = "brand" }) {
  const glow = accent === "gold" ? "bg-brand-gold/20" : "bg-brand/25";
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-ink px-12 py-14 text-white lg:flex">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className={`absolute -right-24 -top-24 h-96 w-96 rounded-full ${glow} blur-3xl`} />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img src={LOGO_MARK} alt="AfriFreelance" className="h-10 w-10" />
          <span className="font-display text-xl font-bold tracking-tight">AfriFreelance</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold/80">{tagline}</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight">Le talent africain rencontre le monde.</h2>
          <p className="mt-4 text-white/60">Une marketplace premium pour recruter, livrer et être payé — sans frictions.</p>
          <ul className="mt-8 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-brand-gold">✓</span>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-sm text-white/50">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-white/40">© 2026 AfriFreelance — Dakar · Paris · Abidjan</div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <img src={LOGO_MARK} alt="AfriFreelance" className="h-9 w-9" />
          <span className="font-display text-lg font-bold text-brand-ink">AfriFreelance</span>
        </div>
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
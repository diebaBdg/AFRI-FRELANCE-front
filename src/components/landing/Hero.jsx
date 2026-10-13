import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const examples = [
  "Développeur React",
  "Designer UI/UX",
  "Community Manager",
  "Expert SEO",
  "Développeur Spring Boot",
  "Monteur vidéo",
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const go = (q) => navigate(`/freelancers?q=${encodeURIComponent(q || query)}`);

  return (
    <section className="relative overflow-hidden bg-brand-ink text-white">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-5 border border-white/15 bg-white/5 text-white/80 hover:bg-white/10">
            <span className="mr-1">🇸🇳</span> Le talent africain — Built for the world
          </Badge>
          <h1 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Le talent africain
            <br />
            <span className="bg-gradient-to-r from-brand via-brand to-brand-gold bg-clip-text text-transparent">
              rencontre le monde.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60">
            Trouvez les meilleurs talents africains pour vos projets, ou décrochez des missions
            qui correspondent à vos compétences.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <Search className="ml-2 h-5 w-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="Que recherchez-vous ?"
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <Button className="bg-brand hover:bg-brand-dark" onClick={() => go()}>
              Rechercher
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/40">Des talents vérifiés en Afrique et au‑delà.</p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {examples.map((e) => (
              <button
                key={e}
                onClick={() => {
                  setQuery(e);
                  go(e);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition-colors hover:border-brand/40 hover:text-white"
              >
                {e}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full bg-brand hover:bg-brand-dark sm:w-auto" onClick={() => navigate("/freelancers")}>
              Trouver un freelance <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              onClick={() => navigate("/projects")}
            >
              Trouver une mission
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
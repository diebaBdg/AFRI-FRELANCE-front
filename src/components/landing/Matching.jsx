import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const matches = [
  { name: "Diénaba B.", role: "Full‑Stack Developer", score: 96, img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces" },
  { name: "Amadou K.", role: "Backend Engineer", score: 93, img: "https://images.unsplash.com/photo-1500648766835-d59547c5b3da?w=120&h=120&fit=crop&crop=faces" },
  { name: "Fatou S.", role: "Full‑Stack Developer", score: 89, img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=faces" },
];

export default function Matching() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Matching intelligent
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-ink">
            Les bons talents. Plus rapidement.
          </h2>
          <p className="mt-4 text-muted-foreground">
            AfriFreelance analyse les compétences, l’expérience, la disponibilité et les besoins du projet
            pour vous proposer les profils les plus pertinents.
          </p>
          <Button className="mt-7 bg-brand hover:bg-brand-dark" onClick={() => navigate("/freelancers")}>
            Découvrir les talents
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Projet</p>
            <p className="font-display text-lg font-bold text-brand-ink">Développeur Full‑Stack</p>
          </div>
          <div className="mt-5 space-y-3">
            {matches.map((m) => (
              <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                <img src={m.img} alt={m.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-ink">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-sm font-bold text-brand">
                  {m.score}% Match
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Données de démonstration — POC</p>
        </div>
      </div>
    </section>
  );
}
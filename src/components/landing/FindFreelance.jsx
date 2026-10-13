import { Link } from "react-router-dom";
import { ArrowRight, Code, Smartphone, PenTool, Palette, Megaphone, Users, PenLine, Languages, Clapperboard, BrainCircuit, Calculator, Briefcase, Lightbulb, ShieldCheck, Building2, Cpu } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

const iconMap = { Code, Smartphone, PenTool, Palette, Megaphone, Users, PenLine, Languages, Clapperboard, BrainCircuit, Calculator, Briefcase, Lightbulb, ShieldCheck, Building2, Cpu };

// Demo counts per category (POC)
const counts = {
  web: 2450, mobile: 1280, uiux: 1820, graphic: 1340, marketing: 1560, community: 940,
  writing: 870, translation: 620, video: 760, data: 980, finance: 540, admin: 720,
  consulting: 690, security: 410, archi: 380, engineering: 880,
};

export default function FindFreelance() {
  return (
    <section id="categories" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">
            Trouvez le talent dont votre projet a besoin
          </h2>
          <p className="mt-2 text-muted-foreground">Développeurs, designers, experts marketing, consultants et bien plus.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Icon = iconMap[c.icon] || Code;
            return (
              <Link
                key={c.id}
                to={`/freelancers?cat=${c.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {counts[c.id]?.toLocaleString("fr-FR") || "—"} talents
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button className="bg-brand hover:bg-brand-dark" asChild>
            <Link to="/freelancers">Explorer les talents <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
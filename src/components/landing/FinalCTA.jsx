import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative">
          <h2 className="text-balance font-display text-3xl font-bold sm:text-4xl">
            Prêt à travailler sans frontières ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Rejoignez la nouvelle génération de talents et d’entreprises connectés par AfriFreelance.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full bg-white text-brand hover:bg-white/90 sm:w-auto" onClick={() => navigate("/register")}>
              Je suis freelance
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
              onClick={() => navigate("/freelancers")}
            >
              Je cherche un talent
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
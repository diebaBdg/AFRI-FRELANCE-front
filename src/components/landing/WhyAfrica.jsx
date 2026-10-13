import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WhyAfrica() {
  const navigate = useNavigate();
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink">L’Afrique regorge de talents</h2>
        <p className="mt-4 text-muted-foreground">
          Des développeurs aux designers, des experts marketing aux consultants, AfriFreelance donne aux talents
          africains une vitrine pour travailler avec des entreprises du continent et du monde entier.
        </p>
        <p className="mt-2 text-sm font-medium text-brand">Talent + ambition + opportunité.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button className="bg-brand hover:bg-brand-dark" onClick={() => navigate("/register")}>
            Créer mon profil freelance
          </Button>
          <Button variant="outline" onClick={() => navigate("/freelancers")}>Explorer les talents</Button>
        </div>
      </div>
    </section>
  );
}
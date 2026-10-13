import { useNavigate } from "react-router-dom";
import { X, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AuthGateModal({
  open,
  onOpenChange,
  title = "Rejoignez AfriFreelance",
  message = "Créez gratuitement votre compte pour contacter des talents, publier des projets et collaborer sans frontières.",
}) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <button onClick={() => onOpenChange(false)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
        <div className="py-2 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-light text-brand">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-brand-ink">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 space-y-2">
            <Button className="w-full bg-brand hover:bg-brand-dark" onClick={() => navigate("/register")}>
              <UserPlus className="mr-2 h-4 w-4" /> Créer un compte
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              <LogIn className="mr-2 h-4 w-4" /> Se connecter
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
              Continuer à explorer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
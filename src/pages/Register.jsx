import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Briefcase, Search, Check, User, Phone } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { safeReturnTo } from "@/lib/authReturnTo";

const TYPE_CARDS = [
  { value: "ROLE_CLIENT", icon: Search, title: "Je recrute", text: "Je publie des missions et recrute des freelances." },
  { value: "ROLE_FREELANCER", icon: Briefcase, title: "Je propose mes services", text: "Je réponds aux projets et livre mon travail." },
];

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function Register() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("ROLE_CLIENT");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const accent = accountType === "ROLE_FREELANCER" ? "gold" : "brand";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!accountType) return setError("Choisissez un type de compte.");
    if (!STRONG_PASSWORD.test(password)) {
      return setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
    }
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      await api.auth.register({
        email,
        password,
        confirmPassword,
        nom,
        prenom,
        phone: phone.replace(/\s+/g, ""),
      });
      try {
        await api.auth.loginViaEmailPassword(email, password);
        await api.auth.updateMe({ account_type: accountType });
        window.location.href = safeReturnTo();
        return;
      } catch {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      tagline="Rejoignez la plateforme"
      title="Créer votre compte"
      subtitle="Choisissez votre profil et commencez en deux minutes."
      accent={accent}
      footer={<>Déjà inscrit ? <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium text-primary hover:underline">Connectez-vous</Link></>}
    >
      <div className="mb-6 grid grid-cols-2 gap-3">
        {TYPE_CARDS.map((c) => {
          const active = accountType === c.value;
          return (
            <button key={c.value} type="button" onClick={() => setAccountType(c.value)} className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-brand bg-brand-light/60 ring-2 ring-brand/30" : "border-border hover:border-brand/40"}`}>
              <div className="flex items-center justify-between">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}><c.icon className="h-4 w-4" /></span>
                {active && <Check className="h-4 w-4 text-brand" />}
              </div>
              <p className="mt-3 text-sm font-semibold text-brand-ink">{c.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.text}</p>
            </button>
          );
        })}
      </div>

      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} className="h-12 pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="phone" type="tel" placeholder="771234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 pl-10" required />
          </div>
          <p className="text-xs text-muted-foreground">Format : 9 chiffres, éventuellement préfixé par +221.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création…</> : "Créer mon compte"}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}

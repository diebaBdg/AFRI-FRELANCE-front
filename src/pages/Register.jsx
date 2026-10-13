import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Briefcase, Search, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const TYPE_CARDS = [
  { value: "ROLE_CLIENT", icon: Search, title: "Je recrute", text: "Je publie des missions et recrute des freelances." },
  { value: "ROLE_FREELANCER", icon: Briefcase, title: "Je propose mes services", text: "Je réponds aux projets et livre mon travail." },
];

export default function Register() {
  const [accountType, setAccountType] = useState("ROLE_CLIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const accent = accountType === "ROLE_FREELANCER" ? "gold" : "brand";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!accountType) return setError("Choisissez un type de compte.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      // Persist the chosen account type on the user record (best-effort, non-blocking on failure)
      try { await base44.auth.updateMe({ account_type: accountType }); } catch { /* ignore */ }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Code de vérification invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code envoyé", description: "Vérifiez votre boîte mail." });
    } catch (err) {
      setError(err.message || "Impossible de renvoyer le code");
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", safeReturnTo());

  if (showOtp) {
    return (
      <AuthSplitLayout tagline="Dernière étape" title="Vérifiez votre e-mail" subtitle={`Un code a été envoyé à ${email}`} accent={accent}>
        {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <div className="mb-6 flex justify-center">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="h-12 w-full font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification…</> : "Vérifier"}
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas de code reçu ? <button onClick={handleResend} className="font-medium text-primary hover:underline">Renvoyer</button>
        </p>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      tagline="Rejoignez la plateforme"
      title="Créer votre compte"
      subtitle="Choisissez votre profil et commencez en deux minutes."
      accent={accent}
      footer={<>Déjà inscrit ? <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium text-primary hover:underline">Connectez-vous</Link></>}
    >
      {/* Account type selection */}
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

      <Button variant="outline" className="mb-6 h-12 w-full text-sm font-medium" onClick={handleGoogle}>
        <GoogleIcon className="mr-2 h-5 w-5" /> Continuer avec Google
      </Button>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-muted-foreground">ou</span></div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
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
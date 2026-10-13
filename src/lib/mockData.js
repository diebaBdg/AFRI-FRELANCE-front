// Static taxonomies & helpers only — NO record data. All records live in the DB.
export const COMMISSION_RATE = 0.10;

export const COUNTRIES = [
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

export const CATEGORIES = [
  { id: "web", name: "Développement Web", icon: "Code" },
  { id: "mobile", name: "Développement Mobile", icon: "Smartphone" },
  { id: "uiux", name: "UI/UX Design", icon: "PenTool" },
  { id: "graphic", name: "Graphisme", icon: "Palette" },
  { id: "marketing", name: "Marketing Digital", icon: "Megaphone" },
  { id: "community", name: "Community Management", icon: "Users" },
  { id: "writing", name: "Rédaction", icon: "PenLine" },
  { id: "translation", name: "Traduction", icon: "Languages" },
  { id: "video", name: "Vidéo & Animation", icon: "Clapperboard" },
  { id: "data", name: "Data & IA", icon: "BrainCircuit" },
  { id: "finance", name: "Finance & Comptabilité", icon: "Calculator" },
  { id: "admin", name: "Administration", icon: "Briefcase" },
  { id: "consulting", name: "Consulting", icon: "Lightbulb" },
  { id: "security", name: "Cybersécurité", icon: "ShieldCheck" },
  { id: "archi", name: "Architecture", icon: "Building2" },
  { id: "engineering", name: "Ingénierie", icon: "Cpu" },
];

export const countryBy = (v) => COUNTRIES.find((c) => c.code === v || c.name === v) || null;
export const flagFor = (v) => countryBy(v)?.flag || "🌍";

export const formatMoney = (amount, currency = "FCFA") => {
  if (currency === "EUR") return `${amount}€`;
  if (currency === "USD") return `$${amount}`;
  if (currency === "GBP") return `£${amount}`;
  return `${Number(amount || 0).toLocaleString("fr-FR")} ${currency}`;
};
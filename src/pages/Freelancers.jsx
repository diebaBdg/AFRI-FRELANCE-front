import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Star, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import FreelancerCard from "@/components/FreelancerCard";
import { CATEGORIES, COUNTRIES } from "@/lib/mockData";
import { fetchFreelancers } from "@/lib/freelancerView";

const sortOptions = [
  { value: "relevance", label: "Pertinence" },
  { value: "rating", label: "Mieux noté" },
  { value: "rate-asc", label: "Tarif croissant" },
  { value: "rate-desc", label: "Tarif décroissant" },
  { value: "new", label: "Nouveaux profils" },
];

export default function Freelancers() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [cat, setCat] = useState(params.get("cat") || "all");
  const [country, setCountry] = useState("all");
  const [rateMax, setRateMax] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(params.get("q") || "");
    setCat(params.get("cat") || "all");
  }, [params]);

  useEffect(() => {
    let alive = true;
    fetchFreelancers({ limit: 100 }).then((r) => { if (alive) { setAll(r); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const results = useMemo(() => {
    let list = all.filter((f) => {
      if (query && !`${f.name} ${f.title} ${(f.skills || []).join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (cat !== "all" && f.category !== cat) return false;
      if (country !== "all" && f.country !== country) return false;
      if (f.rate > rateMax) return false;
      if (f.rating < minRating) return false;
      if (onlyAvailable && !f.available) return false;
      if (onlyVerified && !f.verified.pro) return false;
      return true;
    });
    list = [...list];
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "rate-asc") list.sort((a, b) => a.rate - b.rate);
    else if (sort === "rate-desc") list.sort((a, b) => b.rate - a.rate);
    else if (sort === "new") list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return list;
  }, [all, query, cat, country, rateMax, minRating, onlyAvailable, onlyVerified, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-ink">Talents africains</h1>
        <p className="mt-1 text-muted-foreground">{loading ? "…" : `${results.length} freelances disponibles — profils vérifiés.`}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un talent, une compétence..." className="pl-10" />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>{sortOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" className="sm:hidden" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtres
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-20 space-y-5 rounded-2xl border border-border bg-white p-5">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catégorie</Label>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pays</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.name}>{c.flag} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tarif max</Label>
                <span className="text-sm font-semibold text-brand">{rateMax}$/h</span>
              </div>
              <input type="range" min={5} max={100} value={rateMax} onChange={(e) => setRateMax(Number(e.target.value))} className="mt-3 w-full accent-brand" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note minimum</Label>
              <div className="mt-2 flex gap-1">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button key={r} onClick={() => setMinRating(r)} className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${minRating === r ? "border-brand bg-brand-light text-brand" : "border-border text-muted-foreground"}`}>
                    {r === 0 ? "Toutes" : <><Star className="h-3 w-3 fill-brand-gold text-brand-gold" /> {r}+</>}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="accent-brand" /> Disponible maintenant</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyVerified} onChange={(e) => setOnlyVerified(e.target.checked)} className="accent-brand" /> Profil vérifié (Pro)</label>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setCat("all"); setCountry("all"); setRateMax(100); setMinRating(0); setOnlyAvailable(false); setOnlyVerified(false); setQuery(""); }}>Réinitialiser</Button>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="grid place-items-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : results.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground">Aucun talent ne correspond à vos filtres.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((f) => <FreelancerCard key={f.id} freelancer={f} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
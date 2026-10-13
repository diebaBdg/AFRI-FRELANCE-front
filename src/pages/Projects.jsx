import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ProjectCard from "@/components/ProjectCard";
import { CATEGORIES } from "@/lib/mockData";
import { fetchPublishedProjects } from "@/lib/projectView";

export default function Projects() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [real, setReal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setQuery(params.get("q") || ""); }, [params]);

  useEffect(() => {
    let alive = true;
    fetchPublishedProjects().then((r) => {
      if (alive) { setReal(r); setLoading(false); }
    });
    return () => { alive = false; };
  }, []);

  const results = useMemo(() => {
    let list = real.filter((p) => {
      if (query && !`${p.title} ${p.description} ${(p.skills || []).join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (cat !== "all" && p.category !== cat) return false;
      return true;
    });
    if (sort === "budget") list.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0));
    else if (sort === "proposals") list.sort((a, b) => (b.proposals || 0) - (a.proposals || 0));
    return list;
  }, [query, cat, sort, real]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-ink">Missions disponibles</h1>
          <p className="mt-1 text-muted-foreground">{results.length} projets ouverts — postulez en un clic.</p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark" onClick={() => (window.location.href = "/post-project")}><Plus className="mr-2 h-4 w-4" /> Publier un projet</Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une mission..." className="pl-10" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes catégories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Pertinence</SelectItem>
            <SelectItem value="budget">Budget élevé</SelectItem>
            <SelectItem value="proposals">Plus de candidatures</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des missions…</div>
      ) : results.length === 0 ? (
        <div className="mt-16 grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">Aucune mission pour le moment.</div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
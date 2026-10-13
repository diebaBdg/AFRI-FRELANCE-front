import { useState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { arr } from "@/lib/profiles";

export default function ChipInput({ items = [], onChange, levels, suggestions = [], placeholder = "Ajouter…" }) {
  const [text, setText] = useState("");
  const [lvl, setLvl] = useState(levels[0]?.value || "");
  const listId = useId();

  const add = () => {
    const name = text.trim();
    if (!name) return;
    if (arr(items).some((s) => s.name === name)) { setText(""); return; }
    onChange([...arr(items), { name, level: lvl }]);
    setText("");
  };
  const setLevel = (i, level) => onChange(items.map((s, idx) => (idx === i ? { ...s, level } : s)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <datalist id={listId}>
        {suggestions.map((s) => <option key={s} value={s} />)}
      </datalist>
      <div className="flex gap-2">
        <Input value={text} list={listId} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={placeholder} />
        <select value={lvl} onChange={(e) => setLvl(e.target.value)} className="h-9 w-32 rounded-md border border-input bg-transparent px-2 text-sm">
          {levels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <Button type="button" variant="outline" size="icon" onClick={add} aria-label="Ajouter"><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {arr(items).map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-light/40 py-1 pl-3 pr-1 text-sm">
            <span className="font-medium text-brand-ink">{s.name}</span>
            <select value={s.level || ""} onChange={(e) => setLevel(i, e.target.value)} className="cursor-pointer rounded-full border-0 bg-transparent text-xs text-muted-foreground focus:outline-none">
              {levels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <button onClick={() => remove(i)} className="grid h-5 w-5 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive" aria-label="Retirer"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
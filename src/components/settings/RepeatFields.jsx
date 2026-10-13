import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { arr } from "@/lib/profiles";

function Field({ row, field, onChange }) {
  const value = row[field.key] ?? (field.type === "checkbox" ? false : field.type === "tags" ? [] : "");
  const set = (v) => onChange({ ...row, [field.key]: v });

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-brand" />
        {field.label}
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <div className="space-y-1">
        {field.label && <Label>{field.label}</Label>}
        <select value={value || ""} onChange={(e) => set(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="">—</option>
          {(field.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="space-y-1 md:col-span-2">
        {field.label && <Label>{field.label}</Label>}
        <Textarea value={value} rows={2} onChange={(e) => set(e.target.value)} placeholder={field.placeholder} />
      </div>
    );
  }
  if (field.type === "image") {
    return (
      <div className="space-y-1 md:col-span-2">
        {field.label && <Label>{field.label}</Label>}
        <div className="flex items-center gap-3">
          {value ? <Image src={value} fittingType="fill" className="h-16 w-24 rounded-lg border border-border" /> : <div className="grid h-16 w-24 place-items-center rounded-lg border border-dashed border-border text-muted-foreground text-xs">Aperçu</div>}
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"><Upload className="h-4 w-4" /> Choisir une image</span>
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; e.target.value = "";
              if (!file) return;
              try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); set(file_url); } catch {}
            }} />
          </label>
          {value && <button onClick={() => set("")} className="text-xs text-destructive hover:underline">Retirer</button>}
        </div>
      </div>
    );
  }
  if (field.type === "tags") {
    return (
      <div className="space-y-1 md:col-span-2">
        {field.label && <Label>{field.label}</Label>}
        <div className="flex flex-wrap gap-2">
          {arr(value).map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-light/50 px-2.5 py-1 text-xs text-brand">
              {v}
              <button onClick={() => set(arr(value).filter((_, idx) => idx !== i))} className="text-brand/60 hover:text-brand">×</button>
            </span>
          ))}
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                e.preventDefault(); set([...arr(value), e.currentTarget.value.trim()]); e.currentTarget.value = "";
              }
            }}
            placeholder="Entrée pour ajouter…"
            className="min-w-[140px] flex-1 rounded-md border border-input px-2 py-1 text-sm"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {field.label && <Label>{field.label}</Label>}
      <Input
        type={field.type || "text"}
        value={value}
        onChange={(e) => set(field.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

export default function RepeatFields({ items = [], fields, onChange, addLabel = "Ajouter", emptyLabel = "", titleKey }) {
  const list = arr(items);
  const set = (i, row) => onChange(list.map((x, idx) => (idx === i ? row : x)));
  const add = () => onChange([...list, {}]);
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {list.length === 0 && emptyLabel && <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">{emptyLabel}</p>}
      {list.map((row, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-3">
          {titleKey && <p className="mb-2 text-sm font-semibold text-brand-ink">{row[titleKey] || "Nouvelle entrée"}</p>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((f) => <Field key={f.key} row={row} field={f} onChange={(r) => set(i, r)} />)}
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-4 w-4" /> Supprimer</Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" /> {addLabel}</Button>
    </div>
  );
}
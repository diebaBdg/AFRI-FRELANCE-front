import { Star } from "lucide-react";

export default function Rating({ value = 0, count, size = 14, showValue = true }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={i <= Math.round(value) ? "fill-brand-gold text-brand-gold" : "fill-none text-muted-foreground/40"}
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-foreground">{value.toFixed(1)}</span>}
      {count != null && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}
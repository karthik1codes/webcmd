"use client";

import { useMemo } from "react";
import type { SearchFilters, TimePreset } from "../lib/types";

interface FiltersPanelProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
}

const timeOptions: Array<{ id: TimePreset; label: string }> = [
  { id: "early-morning", label: "Early Morning" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

const formatOptions: string[] = [
  "3D",
  "2D",
  "4DX-3D",
  "ICE 3D",
  "3D SCREEN X",
];

const priceOptions: Array<{ id: string; label: string }> = [
  { id: "100-200", label: "₹ 100 – ₹ 200" },
  { id: "200-300", label: "₹ 200 – ₹ 300" },
  { id: "300-400", label: "₹ 300 – ₹ 400" },
  { id: "400-500", label: "₹ 400 – ₹ 500" },
  { id: "500-600", label: "₹ 500 – ₹ 600" },
  { id: "600-700", label: "₹ 600 – ₹ 700" },
  { id: "700-800", label: "₹ 700 – ₹ 800" },
  { id: "800-900", label: "₹ 800 – ₹ 900" },
  { id: "900-1000", label: "₹ 900 – ₹ 1000" },
];

const othersOptions: string[] = [
  "Recliners",
  "Wheelchair Friendly",
  "Premium Seats",
];

export default function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  const timeSet = useMemo(() => new Set(filters.timePresets), [filters.timePresets]);
  const formatSet = useMemo(() => new Set(filters.formatPresets), [filters.formatPresets]);
  const priceSet = useMemo(() => new Set(filters.pricePresets), [filters.pricePresets]);
  const othersSet = useMemo(() => new Set(filters.others), [filters.others]);

  function toggleTime(id: TimePreset) {
    const next = new Set(filters.timePresets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, timePresets: [...next] });
  }

  function toggleFormat(id: string) {
    const next = new Set(filters.formatPresets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, formatPresets: [...next] });
  }

  function togglePrice(id: string) {
    const next = new Set(filters.pricePresets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, pricePresets: [...next] });
  }

  function toggleOthers(id: string) {
    const next = new Set(filters.others);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, others: [...next] });
  }

  return (
    <section className="glass-panel surface-shine rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-text">
            Refine your show
          </h2>
          <p className="mt-1 text-[11px] text-text-muted">
            Clean, fast filtering before you search.
          </p>
        </div>
        {(filters.timePresets.length > 0 ||
          filters.formatPresets.length > 0 ||
          filters.pricePresets.length > 0 ||
          filters.others.length > 0) && (
          <button
            type="button"
            onClick={() =>
              onChange({
                timePresets: [],
                formatPresets: [],
                pricePresets: [],
                largeScreens: [],
                others: [],
              })
            }
            className="text-xs font-medium text-text-muted hover:text-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Show Time
          </p>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map((t) => {
              const active = timeSet.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTime(t.id)}
                  className={[
                    "rounded-2xl border px-3 py-2.5 text-left transition-all",
                    "text-xs font-medium",
                    active
                      ? "border-accent/40 bg-gradient-to-br from-accent-soft to-blue-soft text-text shadow-[0_10px_28px_rgba(124,58,237,0.16)]"
                      : "border-white/6 bg-white/[0.03] text-text-secondary hover:bg-white/[0.05] hover:text-text",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((f) => {
              const active = formatSet.has(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFormat(f)}
                  className={[
                    "rounded-2xl border px-3 py-2.5 text-left transition-all",
                    "text-xs font-medium",
                    active
                      ? "border-accent/40 bg-gradient-to-br from-accent-soft to-blue-soft text-text shadow-[0_10px_28px_rgba(124,58,237,0.16)]"
                      : "border-white/6 bg-white/[0.03] text-text-secondary hover:bg-white/[0.05] hover:text-text",
                  ].join(" ")}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Price
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-[210px] overflow-auto pr-1">
            {priceOptions.map((p) => {
              const active = priceSet.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePrice(p.id)}
                  className={[
                    "rounded-2xl border px-3 py-2.5 text-left transition-all",
                    "text-xs font-medium",
                    active
                      ? "border-accent/40 bg-gradient-to-br from-accent-soft to-blue-soft text-text shadow-[0_10px_28px_rgba(124,58,237,0.16)]"
                      : "border-white/6 bg-white/[0.03] text-text-secondary hover:bg-white/[0.05] hover:text-text",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Others
          </p>
          <div className="grid grid-cols-1 gap-2">
            {othersOptions.map((o) => {
              const active = othersSet.has(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggleOthers(o)}
                  className={[
                    "rounded-2xl border px-3 py-2.5 text-left transition-all",
                    "text-xs font-medium",
                    active
                      ? "border-accent/40 bg-gradient-to-br from-accent-soft to-blue-soft text-text shadow-[0_10px_28px_rgba(124,58,237,0.16)]"
                      : "border-white/6 bg-white/[0.03] text-text-secondary hover:bg-white/[0.05] hover:text-text",
                  ].join(" ")}
                >
                  {o}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-text-muted/60">
            “Others” are shown as UI filters. District may enforce them on the seat page.
          </p>
        </div>
      </div>
    </section>
  );
}


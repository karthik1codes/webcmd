"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SeatPreference } from "../lib/types";

interface SeatPrefModalProps {
  current: SeatPreference | null;
  onSave: (pref: SeatPreference) => void;
  onClose: () => void;
}

export default function SeatPrefModal({
  current,
  onSave,
  onClose,
}: SeatPrefModalProps) {
  const [count, setCount] = useState(current?.count || 2);
  const [timePref, setTimePref] = useState(current?.timePreference || "");
  const [pricePref, setPricePref] = useState(current?.pricePreference || "any");

  const times = ["", "morning", "afternoon", "evening", "night"];
  const prices = ["any", "cheapest"];

  function handleSave() {
    onSave({ count, timePreference: timePref, pricePreference: pricePref });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-text">Preferences</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Ticket count */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              Tickets
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                    count === n
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-bg-elevated text-text-secondary hover:border-text-muted/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Time preference */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              Default time
            </label>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => (
                <button
                  key={t || "any-time"}
                  onClick={() => setTimePref(t)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    timePref === t
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-bg-elevated text-text-secondary hover:border-text-muted/30"
                  }`}
                >
                  {t || "Any time"}
                </button>
              ))}
            </div>
          </div>

          {/* Price preference */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              Price
            </label>
            <div className="flex gap-2">
              {prices.map((p) => (
                <button
                  key={p}
                  onClick={() => setPricePref(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    pricePref === p
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-bg-elevated text-text-secondary hover:border-text-muted/30"
                  }`}
                >
                  {p === "any" ? "Any price" : "Cheapest first"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full rounded-xl bg-text py-2.5 text-sm font-medium text-bg transition-all hover:bg-text/90 active:scale-[0.98]"
        >
          Save
        </button>
      </div>
    </div>
  );
}

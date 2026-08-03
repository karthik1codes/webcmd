"use client";

import { Armchair, Settings } from "lucide-react";
import type { SeatPreference } from "../lib/types";

interface SeatPrefBannerProps {
  pref: SeatPreference | null;
  onEdit: () => void;
}

export default function SeatPrefBanner({ pref, onEdit }: SeatPrefBannerProps) {
  return (
    <button
      onClick={onEdit}
      className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-bg-card/50 px-4 py-2.5 text-left transition-colors hover:bg-bg-card"
    >
      <Armchair className="h-4 w-4 text-text-muted shrink-0" />
      {pref ? (
        <span className="flex-1 text-xs text-text-secondary">
          {pref.count} ticket{pref.count > 1 ? "s" : ""}
          {pref.timePreference && <> · <span className="text-text">{pref.timePreference}</span></>}
          {pref.pricePreference && <> · <span className="text-text">{pref.pricePreference}</span></>}
        </span>
      ) : (
        <span className="flex-1 text-xs text-text-muted">
          Set preferences (tickets, time, price)
        </span>
      )}
      <Settings className="h-3.5 w-3.5 text-text-muted" />
    </button>
  );
}

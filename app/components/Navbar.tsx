"use client";

import { Sparkles, Ticket } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/6 bg-bg/55 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="surface-shine glass-panel flex h-10 w-10 items-center justify-center rounded-2xl">
            <Ticket className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-text">
              PayFlow
            </p>
            <p className="text-[11px] text-text-muted">
              Agentic movie discovery
            </p>
          </div>
        </div>

        <div className="glass-panel flex items-center gap-2 rounded-full px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue" />
          <span className="h-[5px] w-[5px] rounded-full bg-success pulse-dot" />
          <span className="text-[11px] font-medium text-text-secondary tracking-[0.01em]">
            webcmd connected
          </span>
        </div>
      </div>
    </nav>
  );
}

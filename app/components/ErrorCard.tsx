"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  message: string;
  suggestions?: string[];
  onSuggestion: (title: string) => void;
  onReset: () => void;
}

export default function ErrorCard({
  message,
  suggestions,
  onSuggestion,
  onReset,
}: ErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-accent/20 bg-bg-card overflow-hidden"
    >
      <div className="px-5 py-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-accent shrink-0" />
          <div>
            <p className="text-sm font-medium text-text">
              Couldn&apos;t complete your request
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-text-muted">
              Currently showing on District:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    onSuggestion(`2 tickets for ${s}, evening show`)
                  }
                  className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs text-text-secondary transition-all hover:border-text-muted/30 hover:text-text active:scale-[0.97]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full rounded-xl border border-border py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-card-hover active:scale-[0.99]"
        >
          Try again
        </button>
      </div>
    </motion.div>
  );
}

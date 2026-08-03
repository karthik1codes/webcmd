"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Terminal,
  Globe,
  PackageSearch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import type { AgentStep } from "../lib/types";

const iconMap: Record<AgentStep["type"], React.ElementType> = {
  thinking: Brain,
  command: Terminal,
  browser: Globe,
  extract: PackageSearch,
  done: CheckCircle2,
  error: AlertCircle,
  info: Clock,
};

interface AgentLogProps {
  steps: AgentStep[];
}

export default function AgentLog({ steps }: AgentLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  return (
    <div className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight text-text">
            Agent activity
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            Real-time reasoning and browser execution
          </p>
        </div>
        <div className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">
          Live
        </div>
      </div>

      <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {steps.map((step) => {
          const Icon = iconMap[step.type] || Terminal;
          const isActive = step.status === "active";

          return (
            <motion.div
              key={step.id + step.status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 rounded-2xl px-3.5 py-3.5 ${
                isActive
                  ? "bg-white/[0.045] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                  : "bg-white/[0.02]"
              }`}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0 rounded-2xl border border-white/6 bg-white/[0.04] p-2">
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue" />
                ) : step.status === "error" ? (
                  <AlertCircle className="h-4 w-4 text-accent" />
                ) : step.type === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Icon className="h-4 w-4 text-text-muted" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[13px] leading-snug ${
                    isActive
                      ? "text-text font-medium"
                      : step.type === "done"
                        ? "text-success font-medium"
                        : "text-text-secondary"
                  }`}
                >
                  {step.title}
                </p>
                {step.detail && (
                  <p className="mt-0.5 font-mono text-[11px] leading-snug text-text-muted truncate">
                    {step.detail}
                  </p>
                )}
              </div>

              {/* Time */}
              {!isActive && (
                <span className="shrink-0 text-[10px] tabular-nums text-text-muted/50">
                  {formatTime(step.timestamp)}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={bottomRef} />
      </div>
    </div>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

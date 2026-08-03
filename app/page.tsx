"use client";

import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import PromptInput from "./components/PromptInput";
import AgentLog from "./components/AgentLog";
import ReviewCard from "./components/ReviewCard";
import ConfirmationCard from "./components/ConfirmationCard";
import ErrorCard from "./components/ErrorCard";
import FiltersPanel from "./components/FiltersPanel";
import { runAgent } from "./lib/agent";
import { Sparkles, Ticket, WandSparkles } from "lucide-react";
import type {
  AgentStep,
  BookingResult,
  SearchFilters,
  AppStage,
} from "./lib/types";

const quickPrompts = [
  "2 tickets for Spider-Man Brand New Day, evening show",
  "The Odyssey, 7pm in Bengaluru",
  "1 ticket for Dhamaal 4, cheapest show",
];

export default function Home() {
  const [stage, setStage] = useState<AppStage>("home");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    timePresets: [],
    formatPresets: [],
    pricePresets: [],
    largeScreens: [],
    others: [],
  });

  const handleStep = useCallback((step: AgentStep) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === step.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = step;
        return next;
      }
      return [...prev, step];
    });
  }, []);

  async function handleSubmit(query: string) {
    setUserQuery(query);
    setStage("working");
    setSteps([]);
    setBooking(null);
    setErrorMsg("");
    setSuggestions([]);

    const result = await runAgent(query, null, filters, handleStep);

    if (result.ok) {
      setBooking(result.booking);
      setStage("review");
    } else {
      setErrorMsg(result.error);
      setSuggestions(result.suggestions || []);
      setStage("error");
    }
  }

  function handleApprove() {
    setStage("confirmed");
  }

  function handleReset() {
    setStage("home");
    setSteps([]);
    setBooking(null);
    setErrorMsg("");
    setSuggestions([]);
    setUserQuery("");
  }

  const isWorking = stage === "working";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col items-center pt-20">
        <div className="flex w-full max-w-6xl flex-1 flex-col px-5 pb-8">
          {/* Home */}
          {stage === "home" && (
            <div className="flex flex-1 flex-col gap-8 pb-32 w-full">
              <section className="relative overflow-hidden rounded-[36px] border border-white/8 bg-white/[0.03] px-6 py-8 shadow-[0_22px_64px_rgba(0,0,0,0.32)] sm:px-8 sm:py-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.16),transparent_28%)]" />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-text-secondary">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      Real-time show discovery via District + webcmd
                    </div>
                    <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-text sm:text-5xl lg:text-6xl">
                      Find the right screen,
                      <span className="bg-gradient-to-r from-text via-blue to-accent-2 bg-clip-text text-transparent">
                        {" "}
                        not just any showtime.
                      </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-[15px]">
                      Use cinema, locality, price, format, and time filters before you search.
                      The agent narrows real showtimes, then sends you straight into booking with the best match.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[420px]">
                    <div className="glass-panel rounded-2xl p-4">
                      <Ticket className="h-4 w-4 text-blue" />
                      <p className="mt-3 text-sm font-semibold text-text">Real listings</p>
                      <p className="mt-1 text-[12px] leading-5 text-text-muted">
                        No demo catalogs or fake results.
                      </p>
                    </div>
                    <div className="glass-panel rounded-2xl p-4">
                      <WandSparkles className="h-4 w-4 text-accent-2" />
                      <p className="mt-3 text-sm font-semibold text-text">Intent aware</p>
                      <p className="mt-1 text-[12px] leading-5 text-text-muted">
                        Understands area, cinema, time, and filters.
                      </p>
                    </div>
                    <div className="glass-panel rounded-2xl p-4">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <p className="mt-3 text-sm font-semibold text-text">Premium flow</p>
                      <p className="mt-1 text-[12px] leading-5 text-text-muted">
                        Designed around speed and clarity.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[390px_1fr] items-start">
                <div className="space-y-4">
                  <FiltersPanel filters={filters} onChange={setFilters} />
                  <div className="glass-panel rounded-[28px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                      Quick prompts
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      {quickPrompts.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSubmit(q)}
                          className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-left text-[13px] text-text-secondary transition-all hover:border-accent/20 hover:bg-white/[0.05] hover:text-text active:scale-[0.995]"
                        >
                          <span className="mr-1.5 text-text-muted">→</span>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-panel rounded-[30px] p-5 sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                      Describe your request
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text">
                      Search with natural language
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                      Examples: “The Odyssey 7pm Whitefield”, “INOX Segehalli, Dhammal 4 evening show”, or “Cheapest Spider-Man tonight in Bengaluru”.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="glass-panel rounded-2xl p-4">
                      <p className="text-xs font-semibold text-text">Locality-aware</p>
                      <p className="mt-1 text-[12px] leading-5 text-text-muted">
                        Whitefield, Koramangala, Brookefield, or cinema-specific prompts.
                      </p>
                    </div>
                    <div className="glass-panel rounded-2xl p-4">
                      <p className="text-xs font-semibold text-text">Time smart</p>
                      <p className="mt-1 text-[12px] leading-5 text-text-muted">
                        Uses your typed time and filter windows together.
                      </p>
                    </div>
                    <div className="glass-panel rounded-2xl p-4">
                      <p className="text-xs font-semibold text-text">Filter-first</p>
                      <p className="mt-1 text-[12px] leading-5 text-text-muted">
                        Format and price help shape the final match.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active states */}
          {stage !== "home" && (
            <div className="grid flex-1 grid-cols-1 gap-6 py-6 xl:grid-cols-[360px_1fr]">
              <aside className="space-y-4">
                <FiltersPanel filters={filters} onChange={setFilters} />
                <div className="glass-panel rounded-[28px] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Search context
                  </p>
                  <p className="mt-3 text-sm text-text-secondary leading-6">
                    Filters stay visible while you refine prompts, so you can reprompt without rebuilding context.
                  </p>
                </div>
              </aside>

              <div className="flex flex-col gap-5">
                <div className="flex justify-end">
                  <div className="glass-panel max-w-[88%] rounded-[24px] rounded-tr-md px-4 py-3">
                  <p className="text-[14px] leading-relaxed text-text">
                    {userQuery}
                  </p>
                </div>
              </div>

                <AgentLog steps={steps} />

                {stage === "review" && booking && (
                  <ReviewCard
                    booking={booking}
                    onApprove={handleApprove}
                    onReject={handleReset}
                  />
                )}

                {stage === "error" && (
                  <ErrorCard
                    message={errorMsg}
                    suggestions={suggestions}
                    onSuggestion={handleSubmit}
                    onReset={handleReset}
                  />
                )}

                {stage === "confirmed" && booking && (
                  <ConfirmationCard booking={booking} onReset={handleReset} />
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-[#05060a] via-[#05060af2] to-transparent pb-5 pt-5">
            <PromptInput
              onSubmit={handleSubmit}
              disabled={isWorking}
              placeholder={
                stage === "home"
                  ? 'e.g. "2 tickets for The Odyssey, 7pm in Whitefield"'
                  : "Ask the agent to try something different…"
              }
            />
            <p className="mt-3 text-center text-[10px] text-text-muted/40">
              Real data from District by Zomato · Powered by webcmd
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}

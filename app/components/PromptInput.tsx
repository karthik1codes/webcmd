"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (query: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function PromptInput({
  onSubmit,
  disabled,
  placeholder = 'e.g. "Book 2 tickets for Pushpa 2, evening show near Koramangala"',
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="glass-panel surface-shine relative rounded-[26px] transition-colors focus-within:border-white/14">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="w-full resize-none bg-transparent px-5 pt-5 pb-14 text-[15px] leading-relaxed text-text placeholder:text-text-muted/50 outline-none disabled:opacity-50"
      />
      <div className="absolute bottom-3 left-5 text-[10px] text-text-muted/45 hidden sm:block">
        Smart prompts work best: movie, area/cinema, time, ticket count.
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span className="text-[10px] text-text-muted/40 hidden xl:inline">
          Enter to send
        </span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_10px_28px_var(--accent-glow)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

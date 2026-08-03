"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Film,
  MapPin,
  Clock,
  Calendar,
  Layers,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  IndianRupee,
} from "lucide-react";
import type { BookingResult } from "../lib/types";

interface ReviewCardProps {
  booking: BookingResult;
  onApprove: () => void;
  onReject: () => void;
}

export default function ReviewCard({
  booking,
  onApprove,
  onReject,
}: ReviewCardProps) {
  const [showAlts, setShowAlts] = useState(false);

  function handleBookNow() {
    // Open the seat-layout page on District so user can pick seats and pay
    window.open(booking.seatUrl, "_blank");
    onApprove();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-panel surface-shine overflow-hidden rounded-[30px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-success">
          Agent found a match
        </p>
        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-text-muted">
          via {booking.source}
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start gap-3">
          <Film className="mt-0.5 h-4 w-4 text-accent shrink-0" />
          <div>
            <p className="text-lg font-semibold tracking-tight text-text">
              {booking.movie}
            </p>
            <p className="text-xs text-text-muted">{booking.language}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 text-text-muted shrink-0" />
          <p className="text-sm text-text">{booking.venue}</p>
        </div>

        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-text-muted shrink-0" />
          <p className="text-sm text-text-secondary">{booking.format}</p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-text-muted shrink-0" />
          <p className="text-sm text-text">{booking.date}</p>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-text-muted shrink-0" />
          <p className="text-sm text-text font-medium">{booking.showtime}</p>
        </div>

        <div className="flex items-center gap-3">
          <IndianRupee className="h-4 w-4 text-text-muted shrink-0" />
          <p className="text-sm text-text">{booking.priceRange}</p>
        </div>

        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-text-muted shrink-0" />
          <p className="text-sm text-text-secondary">
            {booking.available} seats available
          </p>
        </div>
      </div>

      {/* Alternatives */}
      {booking.alternatives.length > 1 && (
        <div className="border-t border-white/6">
          <button
            onClick={() => setShowAlts(!showAlts)}
            className="flex w-full items-center justify-between px-6 py-3.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <span>
              {booking.alternatives.length - 1} other showtime
              {booking.alternatives.length > 2 ? "s" : ""} available
            </span>
            {showAlts ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showAlts && (
            <div className="px-6 pb-5 space-y-2">
              {booking.alternatives.slice(1).map((alt, i) => (
                <a
                  key={i}
                  href={alt.seatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.035] px-4 py-3 text-sm transition-all hover:border-accent/20 hover:bg-white/[0.05]"
                >
                  <div>
                    <span className="font-medium text-text">{alt.time}</span>
                    <span className="text-text-muted"> · {alt.cinema}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{alt.priceRange}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6 pt-2 space-y-3">
        <button
          onClick={handleBookNow}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-2 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(124,58,237,0.22)] transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          Book on District
          <ExternalLink className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onReject}
          className="w-full rounded-2xl border border-white/8 bg-white/[0.03] py-3 text-sm text-text-muted transition-colors hover:bg-white/[0.05] hover:text-text-secondary active:scale-[0.99]"
        >
          Try different options
        </button>
      </div>
    </motion.div>
  );
}

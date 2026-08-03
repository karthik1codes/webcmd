"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Film, MapPin, Clock, Calendar, ExternalLink } from "lucide-react";
import type { BookingResult } from "../lib/types";

interface ConfirmationCardProps {
  booking: BookingResult;
  onReset: () => void;
}

export default function ConfirmationCard({
  booking,
  onReset,
}: ConfirmationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel surface-shine overflow-hidden rounded-[30px]"
    >
      <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-success-soft to-blue-soft px-6 py-7">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-xl font-bold tracking-tight text-text">
            Redirected to District
          </h3>
          <p className="mt-1 text-xs text-text-muted max-w-xs">
            Complete your seat selection and payment on District.
            The booking page is open in a new tab.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Film className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm font-medium text-text">{booking.movie}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-text-muted shrink-0" />
          <span className="text-sm text-text-secondary">{booking.venue}</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-text-muted shrink-0" />
          <span className="text-sm text-text-secondary">{booking.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-text-muted shrink-0" />
          <span className="text-sm text-text-secondary">
            {booking.showtime} · {booking.priceRange}
          </span>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <a
          href={booking.seatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-2 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(124,58,237,0.22)] transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Open District again
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          onClick={onReset}
          className="w-full rounded-2xl border border-white/8 bg-white/[0.03] py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.05] active:scale-[0.99]"
        >
          Book another movie
        </button>
      </div>
    </motion.div>
  );
}

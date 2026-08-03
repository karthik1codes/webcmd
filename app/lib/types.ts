export interface AgentStep {
  id: string;
  type:
    | "thinking"
    | "command"
    | "browser"
    | "extract"
    | "done"
    | "error"
    | "info";
  title: string;
  detail?: string;
  status: "active" | "done" | "error";
  timestamp: number;
}

export interface BookingResult {
  movie: string;
  language: string;
  venue: string;
  format: string;
  showtime: string;
  date: string;
  priceRange: string;
  available: number;
  showId: string;
  formatId: string;
  seatUrl: string;
  source: string;
  /** All matching showtimes so user can pick an alternative */
  alternatives: ShowtimeOption[];
}

export interface ShowtimeOption {
  time: string;
  cinema: string;
  format: string;
  priceRange: string;
  available: number;
  seatUrl: string;
}

export interface SeatPreference {
  count: number;
  timePreference: string; // "morning" | "afternoon" | "evening" | "night" | ""
  pricePreference: string; // "cheapest" | "any" | ""
}

export type TimePreset =
  | "early-morning"
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export interface SearchFilters {
  // UI filters; applied during showtime selection (no mock data).
  timePresets: TimePreset[];
  formatPresets: string[]; // e.g. "2D", "3D", "4DX-3D", "ICE 3D", "3D SCREEN X"
  pricePresets: string[]; // e.g. "100-200", "200-300", ...
  largeScreens: string[]; // stored for UI, best-effort mapping
  others: string[]; // stored for UI
}

export type AppStage = "home" | "working" | "review" | "confirmed" | "error";

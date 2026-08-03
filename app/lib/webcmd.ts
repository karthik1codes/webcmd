/**
 * Server-side helpers that shell out to the webcmd CLI.
 * Every function returns parsed JSON or throws with a human-readable message.
 */

import { exec as execCb } from "child_process";
import { promisify } from "util";

const run = promisify(execCb);
const TIMEOUT = 90_000; // 90s max per command

async function exec(args: string[]): Promise<unknown> {
  // Escape each arg for shell safety, then join
  const escaped = args.map((a) => {
    // Wrap in double-quotes if it contains spaces or special chars
    if (/[\s"&|<>^]/.test(a)) {
      return `"${a.replace(/"/g, '\\"')}"`;
    }
    return a;
  });
  const cmd = `webcmd ${escaped.join(" ")}`;

  let result: { stdout: string; stderr: string };
  try {
    result = await run(cmd, {
      timeout: TIMEOUT,
      windowsHide: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "webcmd command failed";
    console.error("[webcmd] exec error:", msg);
    throw new Error(`webcmd error: ${msg}`);
  }

  const text = result.stdout.trim();
  if (!text || text === "[]") return [];

  try {
    return JSON.parse(text);
  } catch {
    console.error("[webcmd] non-JSON output:", text.slice(0, 300));
    throw new Error(`webcmd returned non-JSON: ${text.slice(0, 200)}`);
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export interface DistrictMovie {
  rank: number;
  title: string;
  category: string;
  date: string;
  venue: string;
  price: string;
  url: string;
}

export async function searchMovies(
  query: string,
  limit = 10
): Promise<DistrictMovie[]> {
  const data = await exec([
    "district",
    "search",
    query,
    "--tab",
    "movies",
    "--limit",
    String(limit),
    "-f",
    "json",
  ]);
  return data as DistrictMovie[];
}

export async function listMovies(limit = 15): Promise<DistrictMovie[]> {
  const data = await exec([
    "district",
    "listings",
    "movies",
    "--limit",
    String(limit),
    "-f",
    "json",
  ]);
  return data as DistrictMovie[];
}

export interface DistrictShowtime {
  rank: number;
  movie: string;
  language: string;
  date: string;
  time: string;
  cinema: string;
  format: string;
  priceRange: string;
  available: number;
  showId: string;
  formatId: string;
  url: string;
}

export async function getShowtimes(
  movie: string,
  opts: {
    city?: string;
    near?: string;
    cinema?: string;
    date?: string;
    after?: string;
    before?: string;
    quality?: string;
    maxPrice?: number;
    limit?: number;
  } = {}
): Promise<DistrictShowtime[]> {
  const args = ["district", "showtimes", movie];
  if (opts.city) args.push("--city", opts.city);
  if (opts.near) args.push("--near", opts.near);
  if (opts.cinema) args.push("--cinema", opts.cinema);
  if (opts.date) args.push("--date", opts.date);
  if (opts.after) args.push("--after", opts.after);
  if (opts.before) args.push("--before", opts.before);
  if (opts.quality) args.push("--quality", opts.quality);
  if (opts.maxPrice != null) args.push("--max-price", String(opts.maxPrice));
  args.push("--limit", String(opts.limit ?? 20), "-f", "json");

  const data = await exec(args);
  return data as DistrictShowtime[];
}

export interface DistrictSeat {
  rank: number;
  seat: string;
  row: string;
  number: number;
  column: number;
  seatClass: string;
  price: number;
  status: string;
  flags: string;
  showId: string;
  formatId: string;
  url: string;
}

export async function getSeats(
  showIdOrUrl: string,
  opts: {
    formatId?: string;
    contentId?: string;
    seatClass?: string;
    count?: number;
    together?: boolean;
    maxPrice?: number;
    limit?: number;
  } = {}
): Promise<DistrictSeat[]> {
  const args = ["district", "seats", showIdOrUrl];
  if (opts.formatId) args.push("--format-id", opts.formatId);
  if (opts.contentId) args.push("--content-id", opts.contentId);
  if (opts.seatClass) args.push("--class", opts.seatClass);
  if (opts.count) args.push("--count", String(opts.count));
  if (opts.together) args.push("--together", "true");
  if (opts.maxPrice) args.push("--max-price", String(opts.maxPrice));
  args.push("--limit", String(opts.limit ?? 100), "-f", "json");

  const data = await exec(args);
  return data as DistrictSeat[];
}

export interface DistrictCheckout {
  status: string;
  movie: string;
  cinema: string;
  date: string;
  time: string;
  seats: string;
  ticketCount: number;
  orderAmount: string;
  bookingCharge: string;
  total: string;
  paymentUrl: string;
  showId: string;
}

export async function checkout(
  showIdOrUrl: string,
  seats: string,
  opts: {
    formatId?: string;
    contentId?: string;
  } = {}
): Promise<DistrictCheckout> {
  const args = [
    "district",
    "checkout",
    showIdOrUrl,
    "--seats",
    seats,
  ];
  if (opts.formatId) args.push("--format-id", opts.formatId);
  if (opts.contentId) args.push("--content-id", opts.contentId);
  args.push("-f", "json");

  const data = await exec(args);
  if (Array.isArray(data)) return data[0] as DistrictCheckout;
  return data as DistrictCheckout;
}

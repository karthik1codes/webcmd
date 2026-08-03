import type {
  AgentStep,
  BookingResult,
  SeatPreference,
  ShowtimeOption,
  SearchFilters,
  TimePreset,
} from "./types";

type StepCb = (step: AgentStep) => void;

let stepCounter = 0;

function emitStep(
  cb: StepCb,
  type: AgentStep["type"],
  title: string,
  detail?: string,
  status: AgentStep["status"] = "active"
): string {
  const id = `s_${++stepCounter}`;
  cb({ id, type, title, detail, status, timestamp: Date.now() });
  return id;
}

function completeStep(cb: StepCb, id: string, title: string, detail?: string) {
  cb({ id, type: "done", title, detail, status: "done", timestamp: Date.now() });
}

function errorStep(cb: StepCb, title: string, detail?: string) {
  const id = `s_${++stepCounter}`;
  cb({ id, type: "error", title, detail, status: "error", timestamp: Date.now() });
  return id;
}

/**
 * Parse a natural-language booking request into structured parts.
 */
function parseQuery(query: string) {
  const lower = query.toLowerCase();

  // Extract ticket count
  const countMatch = lower.match(/(\d+)\s*tickets?/);
  const count = countMatch ? parseInt(countMatch[1], 10) : 0; // 0 = use pref

  // Time preference
  let after: string | undefined;
  let before: string | undefined;
  let timeLabel = "";

  if (lower.includes("morning")) {
    before = "12:00"; timeLabel = "morning";
  } else if (lower.includes("afternoon")) {
    after = "12:00"; before = "17:00"; timeLabel = "afternoon";
  } else if (lower.includes("evening")) {
    after = "16:00"; before = "20:00"; timeLabel = "evening";
  } else if (lower.includes("night") || lower.includes("late")) {
    after = "20:00"; timeLabel = "night";
  }

  // Explicit time: "7pm", "7:30 PM"
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    if (timeMatch[3] === "pm" && hours < 12) hours += 12;
    if (timeMatch[3] === "am" && hours === 12) hours = 0;
    const mm = timeMatch[2] || "00";
    const afterH = Math.max(0, hours - 1);
    const beforeH = Math.min(23, hours + 1);
    after = `${String(afterH).padStart(2, "0")}:${mm}`;
    before = `${String(beforeH).padStart(2, "0")}:59`;
    timeLabel = `${timeMatch[1]}${timeMatch[2] ? ":" + timeMatch[2] : ""}${timeMatch[3]}`;
  }

  // Location / locality (District uses --near)
  const nearMatch = query.match(/near\s+([A-Za-z\s]+?)(?:,|$)/i);
  let near = nearMatch ? nearMatch[1].trim() : undefined;

  // Support "Whitefield" without the word "near"
  if (!near && /\bwhite\s*field|whitefiled\b/i.test(query)) {
    near = "Whitefield";
  }

  // Cinema (District uses --cinema). For accuracy, we only parse cinema when the
  // user puts it before a comma, e.g.:
  // "INOX Segehalli, Dhammal 4 evening show"
  let cinema: string | undefined = undefined;
  const commaParts = query.split(",").map((p) => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    const maybeCinema = commaParts[0];
    const mc = maybeCinema.toLowerCase();
    if (/(^|\b)(inox|pvr|cinepolis|imax)\b/i.test(mc)) {
      cinema = normalizeCinema(maybeCinema);
    }
  }

  // Remove cinema prefix from the movie search query
  let movieQuery =
    cinema && commaParts.length >= 2 ? commaParts.slice(1).join(", ") : query;

  // Remove locality keywords so they don't pollute the movie search
  movieQuery = movieQuery.replace(/\bwhite\s*field|whitefiled\b/gi, "").trim();

  // City (default Bengaluru)
  let city = "Bengaluru";
  const cityMap: Record<string, string> = {
    mumbai: "Mumbai", delhi: "Delhi", hyderabad: "Hyderabad",
    chennai: "Chennai", pune: "Pune", kolkata: "Kolkata",
    bengaluru: "Bengaluru", bangalore: "Bengaluru",
    kochi: "Kochi", jaipur: "Jaipur", ahmedabad: "Ahmedabad",
  };
  for (const [key, val] of Object.entries(cityMap)) {
    if (lower.includes(key)) { city = val; break; }
  }

  // Movie name — carefully strip non-title parts, keep "The", "A", etc.
  let movieName = movieQuery
    .replace(/\d+\s*tickets?\s*(for|to)?\s*/i, "")
    .replace(/near\s+[A-Za-z\s]+?(,|$)/i, ",")
    .replace(/(morning|afternoon|evening|night|late\s*night)\s*(show)?/i, "")
    .replace(/(\d{1,2}(?::\d{2})?\s*(am|pm))\s*(show)?/i, "")
    .replace(/\bin\s+(bengaluru|bangalore|mumbai|delhi|hyderabad|chennai|pune|kolkata|kochi|jaipur|ahmedabad)\b/i, "")
    .replace(/\b(show|book|get|find|grab|want|need|please|me)\b/gi, "")
    .replace(/,\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!movieName) {
    movieName = movieQuery.split(",")[0]
      .replace(/\d+\s*tickets?\s*(for|to)?\s*/i, "")
      .trim();
  }

  return { movieName, count, city, near, cinema, after, before, timeLabel };
}

export type AgentResult =
  | { ok: true; booking: BookingResult }
  | { ok: false; error: string; suggestions?: string[] };

/**
 * Run the full agent flow with real webcmd API calls.
 */
export async function runAgent(
  query: string,
  pref: SeatPreference | null,
  filters: SearchFilters,
  onStep: StepCb
): Promise<AgentResult> {
  stepCounter = 0;

  // ─── Step 1: Parse ───
  const s1 = emitStep(onStep, "thinking", "Understanding your request…", `Parsing: "${query}"`);
  const parsed = parseQuery(query);
  const ticketCount = parsed.count || pref?.count || 2;
  await tick(300);
  completeStep(
    onStep, s1, "Parsed request",
    `Movie: "${parsed.movieName}" · ${ticketCount} tickets · ${parsed.city}${parsed.near ? ` near ${parsed.near}` : ""}${parsed.timeLabel ? ` · ${parsed.timeLabel}` : ""}`
  );

  // ─── Step 2: Search ───
  const s2 = emitStep(
    onStep, "command", "Searching District for this movie…",
    `$ webcmd district search "${parsed.movieName}" --tab movies -f json`
  );

  let searchRes: { ok: boolean; movies: Array<{ title: string; url: string; date: string }> };
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(parsed.movieName)}`);
    searchRes = await r.json();
  } catch {
    errorStep(onStep, "Failed to reach search API", "Network error");
    return { ok: false, error: "Could not connect to the search API." };
  }

  if (!searchRes.ok || searchRes.movies.length === 0) {
    completeStep(onStep, s2, "Search complete", "No results");
    errorStep(onStep, `"${parsed.movieName}" not found on District`, "Try a different title");

    // Suggest currently playing movies
    let suggestions: string[] = [];
    try {
      const lr = await fetch("/api/search");
      const ld = await lr.json();
      if (ld.ok && ld.movies?.length > 0) {
        suggestions = ld.movies.slice(0, 8).map((m: { title: string }) => m.title);
      }
    } catch { /* ignore */ }

    return {
      ok: false,
      error: `"${parsed.movieName}" is not currently showing on District.`,
      suggestions,
    };
  }

  const movie = searchRes.movies[0];
  completeStep(onStep, s2, `Found "${movie.title}"`, movie.url);

  // ─── Step 3: Showtimes ───
  const s3 = emitStep(
    onStep, "browser", `Loading showtimes for ${movie.title} in ${parsed.city}…`,
    `$ webcmd district showtimes "${movie.title}" --city ${parsed.city}${parsed.near ? ` --near ${parsed.near}` : ""}${parsed.after ? ` --after ${parsed.after}` : ""} -f json`
  );

  type ShowtimeRow = {
    movie: string; language: string; date: string; time: string;
    cinema: string; format: string; priceRange: string; available: number;
    showId: string; formatId: string; url: string;
  };

  let showtimesRes: { ok: boolean; showtimes: ShowtimeRow[]; message?: string };
  try {
    const effectiveAfter =
      filters.timePresets.length > 0 ? timePresetMin(filters.timePresets) : parsed.after;
    const effectiveBefore =
      filters.timePresets.length > 0 ? timePresetMax(filters.timePresets) : parsed.before;

    const chosenQuality =
      filters.formatPresets.length > 0
        ? mapFormatToQuality(filters.formatPresets[0])
        : undefined;

    const chosenPrice =
      filters.pricePresets.length > 0 ? parsePricePreset(filters.pricePresets[0]) : undefined;

    const params = new URLSearchParams({ movie: movie.title, city: parsed.city });
    if (parsed.near) params.set("near", parsed.near);
    if (parsed.cinema) params.set("cinema", parsed.cinema);
    if (effectiveAfter) params.set("after", effectiveAfter);
    if (effectiveBefore) params.set("before", effectiveBefore);
    if (chosenQuality) params.set("quality", chosenQuality);
    if (chosenPrice) params.set("maxPrice", String(chosenPrice.max));

    const r = await fetch(`/api/showtimes?${params}`);
    showtimesRes = await r.json();
  } catch {
    errorStep(onStep, "Failed to fetch showtimes", "Network error");
    return { ok: false, error: "Could not fetch showtimes." };
  }

  if (!showtimesRes.ok || showtimesRes.showtimes.length === 0) {
    completeStep(onStep, s3, "No showtimes found");

    // If time-filtered, re-fetch all times to suggest alternatives
    if (parsed.after || parsed.before) {
      emitStep(onStep, "info", "No shows in that time range. Checking all times…", undefined, "done");

      try {
        const params2 = new URLSearchParams({ movie: movie.title, city: parsed.city });
        if (parsed.near) params2.set("near", parsed.near);
        const r2 = await fetch(`/api/showtimes?${params2}`);
        const st2 = await r2.json();
        if (st2.ok && st2.showtimes.length > 0) {
          const times = st2.showtimes.slice(0, 6).map(
            (s: { time: string; cinema: string; priceRange: string }) =>
              `${s.time} at ${s.cinema} (${s.priceRange})`
          );
          return {
            ok: false,
            error: `No shows for "${movie.title}" at the requested time, but these are available today:\n\n${times.join("\n")}`,
          };
        }
      } catch { /* ignore */ }
    }

    return {
      ok: false,
      error: showtimesRes.message || `No showtimes for "${movie.title}" in ${parsed.city} today.`,
    };
  }

  // Pick the best show. District can show "booking closed" for showtimes whose
  // booking window is over. To reduce failures, consider only showtimes in the
  // future and (when provided) inside the requested time window.
  const allShows = showtimesRes.showtimes;

  const now = new Date();
  const todayYMD = now.toISOString().slice(0, 10);
  const minFutureMs = now.getTime() + 8 * 60 * 1000; // buffer

  const effectiveAfter =
    filters.timePresets.length > 0 ? timePresetMin(filters.timePresets) : parsed.after;
  const effectiveBefore =
    filters.timePresets.length > 0 ? timePresetMax(filters.timePresets) : parsed.before;

  const afterMin = effectiveAfter ? timeToMinutes(effectiveAfter) : null;
  const beforeMin = effectiveBefore ? timeToMinutes(effectiveBefore) : null;
  const targetMin =
    afterMin != null && beforeMin != null ? (afterMin + beforeMin) / 2 : null;

  const chosenPrice =
    filters.pricePresets.length > 0 ? parsePricePreset(filters.pricePresets[0]) : null;
  const priceFiltered = chosenPrice
    ? allShows.filter((s) => priceOverlaps(s.priceRange, chosenPrice.min, chosenPrice.max))
    : allShows;

  const normalized = priceFiltered
    .map((s) => {
      const showMinutes = parseDistrictTimeToMinutes(s.time);
      const showDateYMD = s.date || todayYMD;
      const dt = parseDistrictDateTime(showDateYMD, showMinutes);
      return { s, dt, showMinutes };
    })
    .filter((x) => x.dt.getTime() >= minFutureMs);

  const withinWindow =
    afterMin == null || beforeMin == null
      ? normalized
      : normalized.filter(
          (x) => x.showMinutes >= afterMin && x.showMinutes <= beforeMin
        );

  const candidates = withinWindow.length > 0 ? withinWindow : normalized;

  const scored = candidates
    .map((x) => {
      const diffMin = targetMin == null ? 0 : Math.abs(x.showMinutes - targetMin);
      const minPrice = extractMinPrice(x.s.priceRange);
      const score =
        // Primary: availability (booking reliability)
        x.s.available * 0.06 +
        // Secondary: closeness to requested time window
        -diffMin * 1.0 +
        // If user asked cheapest, bias towards lower price
        (pref?.pricePreference === "cheapest" ? -minPrice * 0.01 : 0);
      return { ...x, score, minPrice };
    })
    .sort((a, b) => b.score - a.score);

  const bestShow = scored[0]?.s || allShows[0];
  const altShows: ShowtimeOption[] = scored.slice(0, 6).map(({ s }) => ({
    time: s.time,
    cinema: s.cinema,
    format: s.format,
    priceRange: s.priceRange,
    available: s.available,
    seatUrl: s.url,
  }));

  completeStep(
    onStep, s3,
    `Found ${allShows.length} showtime${allShows.length > 1 ? "s" : ""}`,
    `Best match: ${bestShow.time} at ${bestShow.cinema} · ${bestShow.priceRange} · ${bestShow.available} seats available`
  );

  // ─── Step 4: Done ───
  emitStep(
    onStep, "done",
    "Ready for your approval",
    `Agent found ${bestShow.time} at ${bestShow.cinema} — review below and complete on District`,
    "done"
  );

  return {
    ok: true,
    booking: {
      movie: bestShow.movie || movie.title,
      language: bestShow.language,
      venue: bestShow.cinema,
      format: bestShow.format,
      showtime: bestShow.time,
      date: bestShow.date,
      priceRange: bestShow.priceRange,
      available: bestShow.available,
      showId: bestShow.showId,
      formatId: bestShow.formatId,
      seatUrl: bestShow.url,
      source: "District by Zomato",
      alternatives: altShows,
    },
  };
}

function tick(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function timeToMinutes(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function parseDistrictTimeToMinutes(time: string) {
  const m = time
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!m) return 0;
  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3];
  if (ampm === "pm" && hours < 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function parseDistrictDateTime(dateYMD: string, minutes: number) {
  const [y, m, d] = dateYMD.split("-").map((x) => parseInt(x, 10));
  const base = new Date(y, m - 1, d, 0, 0, 0, 0);
  return new Date(base.getTime() + minutes * 60 * 1000);
}

function extractMinPrice(priceRange: string) {
  const m = priceRange.match(/INR\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 999999;
}

function mapFormatToQuality(formatPreset: string) {
  const f = formatPreset.trim().toLowerCase();
  if (f === "2d") return "2D";
  if (f === "3d") return "3D";
  if (f === "4dx-3d") return "4DX";
  if (f === "ice 3d") return "ICE 3D";
  if (f === "3d screen x") return "Screen X 3D";
  return formatPreset;
}

function timePresetMin(presets: TimePreset[]) {
  const ranges = presets.map(timePresetToRange);
  const minStart = Math.min(...ranges.map((r) => r.start));
  return minToHHMM(minStart);
}

function timePresetMax(presets: TimePreset[]) {
  const ranges = presets.map(timePresetToRange);
  const maxEnd = Math.max(...ranges.map((r) => r.end));
  return minToHHMM(maxEnd);
}

function timePresetToRange(p: TimePreset) {
  switch (p) {
    case "early-morning":
      return { start: 0, end: 8 * 60 };
    case "morning":
      return { start: 8 * 60, end: 12 * 60 };
    case "afternoon":
      return { start: 12 * 60, end: 16 * 60 };
    case "evening":
      return { start: 16 * 60, end: 19 * 60 };
    case "night":
      return { start: 19 * 60, end: 23 * 60 + 59 };
  }
}

function minToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parsePricePreset(presetId: string) {
  const m = presetId.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return { min: parseInt(m[1], 10), max: parseInt(m[2], 10) };
}

function priceOverlaps(priceRange: string, min: number, max: number) {
  const { min: prMin, max: prMax } = parsePriceRange(priceRange);
  return prMin <= max && prMax >= min;
}

function parsePriceRange(priceRange: string) {
  const parts = priceRange.match(/INR\s*(\d+)\s*-\s*(\d+)/i);
  if (parts) {
    return { min: parseInt(parts[1], 10), max: parseInt(parts[2], 10) };
  }
  const single = priceRange.match(/INR\s*(\d+)/i);
  const v = single ? parseInt(single[1], 10) : 999999;
  return { min: v, max: v };
}

function normalizeCinema(name: string) {
  const cleaned = name.trim().replace(/\s+/g, " ");
  const lower = cleaned.toLowerCase();
  if (lower.startsWith("inox")) {
    return `INOX ${cleaned.slice(4).trim()}`.trim();
  }
  if (lower.startsWith("pvr")) {
    return `PVR ${cleaned.slice(3).trim()}`.trim();
  }
  if (lower.startsWith("cinepolis")) {
    return `Cinepolis ${cleaned.slice("cinepolis".length).trim()}`.trim();
  }
  if (lower.startsWith("imax")) {
    return `IMAX ${cleaned.slice(4).trim()}`.trim();
  }
  return cleaned;
}

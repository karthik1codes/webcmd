import { NextRequest } from "next/server";
import { getShowtimes } from "@/app/lib/webcmd";

export async function GET(req: NextRequest) {
  const movie = req.nextUrl.searchParams.get("movie");
  const city = req.nextUrl.searchParams.get("city") || "Bengaluru";
  const near = req.nextUrl.searchParams.get("near") || undefined;
  const cinema = req.nextUrl.searchParams.get("cinema") || undefined;
  const quality = req.nextUrl.searchParams.get("quality") || undefined;
  const after = req.nextUrl.searchParams.get("after") || undefined;
  const before = req.nextUrl.searchParams.get("before") || undefined;
  const date = req.nextUrl.searchParams.get("date") || undefined;
  const maxPriceRaw = req.nextUrl.searchParams.get("maxPrice") || undefined;
  const maxPrice = maxPriceRaw ? Number.parseFloat(maxPriceRaw) : undefined;

  if (!movie) {
    return Response.json(
      { ok: false, error: "Missing 'movie' parameter", showtimes: [] },
      { status: 400 }
    );
  }

  try {
    const showtimes = await getShowtimes(movie, {
      city,
      near,
      cinema,
      after,
      before,
      date,
      quality,
      maxPrice,
    });

    if (showtimes.length === 0) {
      return Response.json({
        ok: true,
        showtimes: [],
        message: `No showtimes found for "${movie}" in ${city} today.`,
      });
    }

    return Response.json({ ok: true, showtimes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Showtimes fetch failed";
    const lower = msg.toLowerCase();
    const isEmpty =
      msg.includes("EMPTY_RESULT") ||
      lower.includes("no showtimes matched") ||
      lower.includes("returned no data") ||
      lower.includes("empty result");

    if (isEmpty) {
      return Response.json({ ok: true, showtimes: [], message: msg });
    }

    return Response.json({ ok: false, error: msg, showtimes: [] }, { status: 500 });
  }
}

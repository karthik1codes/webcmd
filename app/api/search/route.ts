import { NextRequest } from "next/server";
import { searchMovies, listMovies } from "@/app/lib/webcmd";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  try {
    const movies = q ? await searchMovies(q) : await listMovies();
    return Response.json({ ok: true, movies });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Search failed";
    console.error("[/api/search] error:", msg);
    return Response.json(
      { ok: false, error: msg, movies: [] },
      { status: 500 }
    );
  }
}

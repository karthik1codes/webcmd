import { NextRequest } from "next/server";
import { getSeats } from "@/app/lib/webcmd";

export async function GET(req: NextRequest) {
  const show = req.nextUrl.searchParams.get("show");
  const formatId = req.nextUrl.searchParams.get("formatId") || undefined;
  const contentId = req.nextUrl.searchParams.get("contentId") || undefined;
  const count = req.nextUrl.searchParams.get("count");
  const seatClass = req.nextUrl.searchParams.get("class") || undefined;
  const preferredRow = req.nextUrl.searchParams.get("preferredRow") || undefined;

  if (!show) {
    return Response.json(
      { ok: false, error: "Missing 'show' parameter", seats: [] },
      { status: 400 }
    );
  }

  try {
    const allSeats = await getSeats(show, {
      formatId,
      contentId,
      seatClass,
    });

    const available = allSeats.filter((s) => s.status === "available");

    if (available.length === 0) {
      return Response.json({
        ok: true,
        seats: [],
        recommended: [],
        message: "No seats available for this show.",
      });
    }

    // If user wants N seats with a preferred row, find the best match
    const numSeats = count ? parseInt(count, 10) : 2;
    const recommended = findBestSeats(available, numSeats, preferredRow);

    return Response.json({
      ok: true,
      seats: available,
      recommended,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Seats fetch failed";
    return Response.json(
      { ok: false, error: msg, seats: [], recommended: [] },
      { status: 500 }
    );
  }
}

interface SeatInfo {
  seat: string;
  row: string;
  number: number;
  column: number;
  seatClass: string;
  price: number;
  status: string;
}

/**
 * Find the best N adjacent seats, preferring the user's preferred row.
 * Falls back to rows above, then below, expanding outward.
 */
function findBestSeats(
  available: SeatInfo[],
  count: number,
  preferredRow?: string
): SeatInfo[] {
  // Group by row
  const byRow = new Map<string, SeatInfo[]>();
  for (const s of available) {
    const arr = byRow.get(s.row) || [];
    arr.push(s);
    byRow.set(s.row, arr);
  }

  // Sort rows alphabetically
  const allRows = [...byRow.keys()].sort();

  // Build search order: preferred row first, then expand outward
  let searchOrder: string[];
  if (preferredRow) {
    const prefUpper = preferredRow.toUpperCase();
    const prefIdx = allRows.indexOf(prefUpper);
    if (prefIdx >= 0) {
      searchOrder = [prefUpper];
      let above = prefIdx - 1;
      let below = prefIdx + 1;
      while (above >= 0 || below < allRows.length) {
        if (below < allRows.length) searchOrder.push(allRows[below++]);
        if (above >= 0) searchOrder.push(allRows[above--]);
      }
    } else {
      // Preferred row not in available rows — try closest match
      searchOrder = allRows;
    }
  } else {
    // No preference: pick middle rows (best movie experience)
    const mid = Math.floor(allRows.length / 2);
    searchOrder = [];
    let above = mid - 1;
    let below = mid;
    while (above >= 0 || below < allRows.length) {
      if (below < allRows.length) searchOrder.push(allRows[below++]);
      if (above >= 0) searchOrder.push(allRows[above--]);
    }
  }

  // For each row in search order, find N adjacent seats
  for (const row of searchOrder) {
    const seats = byRow.get(row)!;
    seats.sort((a, b) => a.column - b.column);

    if (seats.length < count) continue;

    // Find best group of adjacent seats (closest to center)
    const groups = findAdjacentGroups(seats, count);
    if (groups.length > 0) {
      // Pick the group closest to center of the row
      const maxCol = Math.max(...seats.map((s) => s.column));
      const center = maxCol / 2;
      groups.sort((a, b) => {
        const aMid = a.reduce((sum, s) => sum + s.column, 0) / a.length;
        const bMid = b.reduce((sum, s) => sum + s.column, 0) / b.length;
        return Math.abs(aMid - center) - Math.abs(bMid - center);
      });
      return groups[0];
    }
  }

  // Fallback: just return the first N available
  return available.slice(0, count);
}

function findAdjacentGroups(
  sortedSeats: SeatInfo[],
  count: number
): SeatInfo[][] {
  const groups: SeatInfo[][] = [];
  for (let i = 0; i <= sortedSeats.length - count; i++) {
    const group = sortedSeats.slice(i, i + count);
    // Check adjacency by column
    let adjacent = true;
    for (let j = 1; j < group.length; j++) {
      if (group[j].column !== group[j - 1].column + 1) {
        adjacent = false;
        break;
      }
    }
    if (adjacent) groups.push(group);
  }
  return groups;
}

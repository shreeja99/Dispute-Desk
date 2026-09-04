import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = "https://dispute-desk.onrender.com";
const MAX_DASHBOARD_DISPUTES = 25;

async function forwardResponse(response: Response) {
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/disputes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const query = new URL(request.url).search;
        const listResponse = await fetch(`${BACKEND_URL}/disputes/${query}`, { cache: "no-store" });
        if (!listResponse.ok) return forwardResponse(listResponse);

        const rows = (await listResponse.json()) as unknown;
        if (!Array.isArray(rows)) return Response.json(rows);

        // The list endpoint returns summary rows. Enrich each one with its
        // detail record so the cards can show evidence and recommendation.
        const details = await Promise.all(
          rows.slice(0, MAX_DASHBOARD_DISPUTES).map(async (row) => {
            const id =
              row && typeof row === "object" && "id" in row ? String((row as { id: unknown }).id) : "";
            if (!id) return row;
            try {
              const detailResponse = await fetch(
                `${BACKEND_URL}/disputes/${encodeURIComponent(id)}`,
                { cache: "no-store" },
              );
              return detailResponse.ok ? await detailResponse.json() : row;
            } catch {
              return row;
            }
          }),
        );

        return Response.json(details);
      },
      POST: async ({ request }) => {
        const body = await request.text();
        const query = new URL(request.url).search;
        const response = await fetch(`${BACKEND_URL}/disputes/${query}`, {
          method: "POST",
          headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
          body,
        });
        return forwardResponse(response);
      },
    },
  },
});

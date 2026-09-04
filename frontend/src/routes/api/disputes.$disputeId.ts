import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = "https://dispute-desk.onrender.com";

export const Route = createFileRoute("/api/disputes/$disputeId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = encodeURIComponent(params.disputeId);
        const response = await fetch(`${BACKEND_URL}/disputes/${id}`, { cache: "no-store" });
        return new Response(await response.text(), {
          status: response.status,
          headers: {
            "content-type": response.headers.get("content-type") ?? "application/json",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = "https://dispute-desk.onrender.com";

export const Route = createFileRoute("/api/voice/converse")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const incoming = await request.formData();
        const history = incoming.get("conversation_history");
        if (typeof history !== "string" || !history) {
          return Response.json({ error: "Conversation history is required." }, { status: 400 });
        }

        const body = new URLSearchParams({ conversation_history: history });
        const response = await fetch(`${BACKEND_URL}/voice/converse`, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
        });
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

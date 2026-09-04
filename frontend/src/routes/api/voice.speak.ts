import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = "https://dispute-desk.onrender.com";

export const Route = createFileRoute("/api/voice/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const incoming = await request.formData();
        const text = incoming.get("text");
        if (typeof text !== "string" || !text) {
          return Response.json({ error: "Text is required." }, { status: 400 });
        }
        const body = new URLSearchParams({ text });
        const response = await fetch(`${BACKEND_URL}/voice/speak`, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
        });
        return new Response(await response.arrayBuffer(), {
          status: response.status,
          headers: {
            "content-type": response.headers.get("content-type") ?? "audio/wav",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
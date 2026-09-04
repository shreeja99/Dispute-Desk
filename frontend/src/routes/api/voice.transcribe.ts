import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = "https://dispute-desk.onrender.com";

export const Route = createFileRoute("/api/voice/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const incoming = await request.formData();
        const audio = incoming.get("audio");
        if (!(audio instanceof File)) {
          return Response.json({ error: "Audio recording is required." }, { status: 400 });
        }

        const body = new FormData();
        body.append("audio", audio, audio.name || "dispute-recording.webm");
        const response = await fetch(`${BACKEND_URL}/voice/transcribe`, {
          method: "POST",
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

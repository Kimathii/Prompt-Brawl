import { analyzeMatch, hasApiKey, streamResponse } from "@/lib/aiClient";
import type { BrawlServerEvent } from "@/lib/types";

export const runtime = "nodejs";

const MAX_PROMPT_LENGTH = 2000;

export async function POST(req: Request) {
  let prompt = "";

  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (!prompt) return jsonError("Prompt is empty", 400);
  if (prompt.length > MAX_PROMPT_LENGTH) return jsonError("Prompt is too long", 400);

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: BrawlServerEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      if (!hasApiKey()) {
        send({ type: "mode", mode: "demo" });
        controller.close();
        return;
      }

      send({ type: "mode", mode: "live" });

      try {
        const analysis = await analyzeMatch(prompt);
        send({ type: "meta", analysis });

        await streamResponse(prompt, (text) => {
          send({ type: "delta", text });
        });

        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Something interrupted the brawl.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

function jsonError(message: string, status: number) {
  const event: BrawlServerEvent = { type: "error", message };
  return new Response(JSON.stringify(event) + "\n", {
    status,
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}

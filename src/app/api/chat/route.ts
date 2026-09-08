import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chat not configured" }, { status: 503 });
  }

  let messages: { role: string; content: string }[];
  let language: "id" | "en";
  try {
    const body = await req.json();
    messages = body.messages;
    language = body.language === "en" ? "en" : "id";
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sanitized = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  let eventContext = "";
  try {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, category: true, startAt: true, locationName: true, isOnline: true, priceIDR: true, capacity: true },
      orderBy: { startAt: "asc" },
      take: 10,
    });

    if (events.length > 0) {
      eventContext =
        "\n\nEvent yang akan datang:\n" +
        events
          .map((e) => {
            const date = e.startAt instanceof Date ? e.startAt.toISOString().split("T")[0] : String(e.startAt);
            const loc = e.isOnline ? "Online" : e.locationName || "TBA";
            const price = e.priceIDR === 0 ? "Gratis" : `Rp ${e.priceIDR.toLocaleString("id-ID")}`;
            return `• ${e.title} — ${date} — ${loc} — ${price} (${e.category})`;
          })
          .join("\n");
    }
  } catch {
    // DB unavailable — chat still works without event context
  }

  const systemPrompt =
    language === "id"
      ? `Kamu adalah asisten virtual HAAJ (Himpunan Astronomi Amatir Jakarta) — komunitas astronomi amatir di Jakarta yang sudah berdiri sejak 1984. Kamu membantu pengunjung website ticketing HAAJ.

Tugas utamamu:
- Menjawab pertanyaan tentang event/astronomi yang diselenggarakan HAAJ
- Membantu proses registrasi event
- Membantu cek tiket & check-in
- Memberikan informasi umum tentang HAAJ

Panduan:
- Jawab dalam Bahasa Indonesia, ramah dan ringkas
- Jika ditanya soal event spesifik, arahkan ke halaman event di website
- Untuk cek tiket, arahkan ke halaman /ticket/lookup
- Untuk daftar event, arahkan ke halaman event terkait
- Jangan mengarang informasi yang tidak kamu ketahui
- Jika tidak yakin, bilang jujur dan sarankan hubungi tim HAAJ${eventContext}`
      : `You are HAAJ's virtual assistant (Amateur Astronomers Association of Jakarta) — an amateur astronomy community in Jakarta established since 1984. You help visitors of the HAAJ ticketing website.

Your main tasks:
- Answer questions about astronomy events organized by HAAJ
- Help with event registration process
- Help with ticket lookup & check-in
- Provide general information about HAAJ

Guidelines:
- Respond in English, friendly and concise
- If asked about specific events, direct to the event page on the website
- For ticket lookup, direct to /ticket/lookup page
- For event registration, direct to the relevant event page
- Don't make up information you don't know
- If unsure, be honest and suggest contacting the HAAJ team${eventContext}`;

  const baseUrl = process.env.QWEN_BASE_URL || "https://coding-intl.dashscope.aliyuncs.com/v1";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen3.7-plus",
        messages: [{ role: "system", content: systemPrompt }, ...sanitized],
        stream: true,
      }),
    });
  } catch {
    return Response.json({ error: "Failed to connect to AI service" }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json({ error: "AI service error" }, { status: 502 });
  }

  const reader = upstream.body?.getReader();
  if (!reader) {
    return Response.json({ error: "No response stream" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

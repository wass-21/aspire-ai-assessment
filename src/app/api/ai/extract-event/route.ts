import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/src/lib/openai";

const BodySchema = z.object({
  text: z.string().min(5),
});

const OutputSchema = z.object({
  title: z.string(),
  location: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  description: z.string().nullable(),
});

export async function POST(req: Request) {
  try {
    const { text } = BodySchema.parse(await req.json());

    const prompt = `
Extract event information from this text:

"${text}"

Return ONLY JSON with:
title: string
location: string or null
start_time: ISO datetime string
end_time: ISO datetime string (assume 1 hour if not specified)
description: string or null

Current date: ${new Date().toISOString()}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: "Extract structured event data in JSON format.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = OutputSchema.parse(JSON.parse(raw));

    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

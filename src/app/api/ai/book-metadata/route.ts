import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/src/lib/openai";

const BodySchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
});

const OutputSchema = z.object({
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());

    const prompt = `
Generate a short book summary and relevant tags.

Title: ${body.title}
Author: ${body.author}

Return ONLY valid JSON with keys:
summary: string (3-5 sentences)
tags: array of 5-8 short tags
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You generate concise book metadata in JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsed = OutputSchema.parse(JSON.parse(text));

    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to generate metadata";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

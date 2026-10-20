import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  context: z.string().trim().max(1200).default(""),
  completedActivityResults: z.array(z.string().trim().max(500)).max(5).default([]),
});

const JourneyDraftSchema = z.object({
  summary: z.string().trim().min(20).max(500),
  activities: z.array(
    z.object({
      title: z.string().trim().min(4).max(120),
      guidance: z.string().trim().min(20).max(700),
      why: z.string().trim().min(10).max(300),
      resultPrompt: z.string().trim().min(10).max(250),
      milestoneTitle: z.string().trim().min(4).max(120),
      milestoneDescription: z.string().trim().min(10).max(300),
    }),
  ).min(3).max(5),
});

export type AIJourneyDraft = z.infer<typeof JourneyDraftSchema>;

const promptFor = (title: string, context: string, completedActivityResults: string[]) => `
You are the practical ambition coach inside Ambition Quest Go. Create a genuinely tailored, achievable journey for this ambition: "${title}".

Additional context from the user:
${context || "No additional context supplied."}

Previously recorded activity results (self-reported, not independently verified):
${completedActivityResults.length ? completedActivityResults.map((result, index) => `${index + 1}. ${result}`).join("\\n") : "None recorded."}

Return ONLY valid JSON with this exact shape:
{
  "summary": "A concise explanation of how this journey is tailored to the ambition",
  "activities": [
    {
      "title": "Specific activity title",
      "guidance": "Clear practical instructions for what the person can do",
      "why": "Why this step matters for this particular ambition",
      "resultPrompt": "A question that helps the person record what they did or learned",
      "milestoneTitle": "Observable milestone title",
      "milestoneDescription": "What this milestone represents"
    }
  ]
}

Rules:
- Produce 3 to 5 sequential activities specific to the actual ambition, not a generic goal template.
- Use the title and user context directly where useful. For unusual ambitions, first clarify the outcome, then research real requirements, then take a safe practical step.
- Each activity must be realistically actionable, with a concrete result the user can record.
- Make each milestone correspond to its activity and describe evidence of progress, not guaranteed success.
- Include research, skill-building, people/resources, cost or risk checks only where relevant. Saving is not the default answer for every ambition.
- Do not invent facts, provider participation, live prices, legal requirements, deadlines, or certainty. Tell the user to verify important current facts with reliable sources or qualified people.
- Never imply the app holds money, that a self-reported action was independently verified, or that a plan guarantees the outcome.
- Use plain, encouraging language. Avoid empty motivational slogans.
- Activities should build on each other and suggest a useful next action after the previous one.
`;

export const generateAmbitionJourney = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AIJourneyDraft> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI service is not configured yet. Add GEMINI_API_KEY to the server environment; never put the key in browser code.",
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptFor(data.title, data.context, data.completedActivityResults) }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
            maxOutputTokens: 5000,
          },
        }),
      },
    );

    if (!response.ok) {
      // Avoid returning provider response bodies that could expose implementation details.
      console.error("Gemini journey generation failed", response.status);
      if (response.status === 429) {
        throw new Error("The AI service is busy or has reached its quota. Please try again later.");
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("The server's Gemini API key was rejected. Check its status and permissions.");
      }
      throw new Error("The AI service could not generate a journey right now. Please try again.");
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) throw new Error("The AI service returned an empty journey. Please try again.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("The AI service returned an unreadable journey. Please try again.");
    }

    const journey = JourneyDraftSchema.parse(parsed);
    return journey;
  });

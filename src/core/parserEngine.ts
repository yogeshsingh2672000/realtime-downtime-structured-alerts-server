import { OpenAIClient } from "./openAiClient.js";
import { extractImportantInfoSchema } from "./StructuredOutputSchema.js";
import { ParsedIncident } from "./types.js";


export async function extractImportantInfo(inputText: string): Promise<ParsedIncident> {
  const client = OpenAIClient.fromEnv();

  const completion = await client.chatCompletion({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Extract important information from the user's text. Return ONLY JSON that conforms to the provided schema.",
      },
      { role: "user", content: inputText },
    ],
    response_format: { type: "json_schema", json_schema: extractImportantInfoSchema },
    temperature: 0,
  });

  const content = completion.text;
  const parsed: ParsedIncident = typeof content === "string" ? JSON.parse(content) : (content as any);
  return parsed;
}



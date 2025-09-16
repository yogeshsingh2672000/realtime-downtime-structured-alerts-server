
// @OpenAiClient.ts

export type OpenAIChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
  };
  
  export type ChatCompletionOptions = {
    model: string;
    messages: OpenAIChatMessage[];
    temperature?: number;
    max_tokens?: number;
    // Allow passing through SDK-supported response formatting options (e.g., json_schema)
    response_format?: any;
  };
  
  export type ChatCompletionResult = {
    text: string;
    raw: any;
  };

// @OpenAiClient.ts


// @parserEngine.ts

export type ParsedIncident = {
    what: string;
    when: number;
    model_affected: string[];
  };

// @parserEngine.ts
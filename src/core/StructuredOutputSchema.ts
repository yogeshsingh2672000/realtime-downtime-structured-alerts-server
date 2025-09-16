export const extractImportantInfoSchema = {
    name: "incident_summary_schema",
    schema: {
      type: "object",
      properties: {
        what: { type: "string", description: "A brief summary of what happened." },
        when: { type: "integer", description: "UTC epoch time in milliseconds when it happened." },
        api_affected: {
          type: ["array", "null"],
          items: { type: "string" },
          description: "List of OpenAI API's that were affected. If not clearly mentioned, set to null.",
        },
        model_affected: {
          type: ["array", "null"],
          items: { type: "string" },
          description: "List of OpenAI models that were affected if clearly mentioned. Otherwise, set to null.",
        },
      },
      required: ["what", "when", "model_affected", "api_affected"],
      additionalProperties: false,
    },
    strict: true,
  };
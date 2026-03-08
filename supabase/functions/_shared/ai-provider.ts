// AI Provider Abstraction Layer
// Reads OpenAI API key from app_config table, falls back to LOVABLE_API_KEY gateway

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AIProvider {
  chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface ChatCompletionParams {
  model?: string;
  messages: { role: string; content: string }[];
  tools?: any[];
  tool_choice?: any;
  temperature?: number;
}

export interface ChatCompletionResponse {
  choices: {
    message: {
      content?: string;
      tool_calls?: { function: { name: string; arguments: string } }[];
    };
  }[];
}

// Cache the OpenAI key per invocation
let cachedOpenAIKey: string | null = null;
let keyFetched = false;

async function getOpenAIKey(): Promise<string | null> {
  if (keyFetched) return cachedOpenAIKey;
  keyFetched = true;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "openai_api_key")
      .maybeSingle();

    cachedOpenAIKey = data?.value && data.value.startsWith("sk-") ? data.value : null;
  } catch (e) {
    console.error("Failed to fetch OpenAI key:", e);
    cachedOpenAIKey = null;
  }
  return cachedOpenAIKey;
}

// Model mapping kept for future provider abstraction
const _OPENAI_MODELS = {
  chat: "gpt-4o-mini",
  embedding: "text-embedding-3-small",
};

export async function createAIProvider(): Promise<AIProvider> {
  const openaiKey = await getOpenAIKey();

  if (!openaiKey) {
    throw new Error("OpenAI API key not configured. Add it in Admin → Settings → OpenAI Configuration.");
  }

  return createOpenAIProvider(openaiKey);
}

function createOpenAIProvider(apiKey: string): AIProvider {
  return {
    async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: params.model || "gpt-4o-mini",
          messages: params.messages,
          tools: params.tools,
          tool_choice: params.tool_choice,
          temperature: params.temperature,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429) throw new AIError("Rate limited by OpenAI", 429);
        if (response.status === 402 || response.status === 401) throw new AIError("OpenAI API key invalid or billing issue", 402);
        throw new AIError(`OpenAI error: ${response.status} ${errText}`, response.status);
      }

      return response.json();
    },

    async generateEmbedding(text: string): Promise<number[]> {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new AIError(`OpenAI embedding error: ${response.status} ${errText}`, response.status);
      }

      const data = await response.json();
      return data.data[0].embedding;
    },
  };
}


export class AIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AIError";
  }
}

// Helper: build text for embedding from restaurant data
export function buildRestaurantEmbeddingText(r: any): string {
  const parts = [
    r.name,
    r.short_description || r.description?.substring(0, 200),
    r.neighborhood,
    r.cuisines?.join(", "),
    r.price_range,
    r.signature_dishes?.join(", "),
    r.popular_dishes?.join(", "),
    r.tags?.join(", "),
    r.ambience,
    r.is_halal ? "halal" : "",
    r.has_delivery ? "delivery available" : "",
    r.has_outdoor_seating ? "outdoor seating" : "",
    r.is_family_friendly ? "family friendly" : "",
  ].filter(Boolean);
  return parts.join(" | ");
}

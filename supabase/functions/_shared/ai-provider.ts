// AI Provider Abstraction Layer — Google Gemini Only
// Reads GEMINI_API_KEY from app_config table

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AIProvider {
  chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse>;
  generateEmbedding(text: string): Promise<number[]>;
  analyzeImage(params: ImageAnalysisParams): Promise<string>;
}

export interface ChatCompletionParams {
  model?: string;
  messages: { role: string; content: string | any[] }[];
  temperature?: number;
  responseSchema?: any;
}

export interface ChatCompletionResponse {
  text: string;
  parsed?: any;
}

export interface ImageAnalysisParams {
  model?: string;
  imageBase64: string;
  mimeType: string;
  prompt: string;
}

// Cache keys and settings
let cachedGeminiKey: string | null = null;
let cachedSettings: { default_model: string; vision_model: string; recommendation_model: string } | null = null;
let keyFetched = false;

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function getGeminiKey(): Promise<string | null> {
  if (keyFetched) return cachedGeminiKey;
  keyFetched = true;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "gemini_api_key")
      .maybeSingle();

    cachedGeminiKey = data?.value && data.value.length > 10 ? data.value : null;
  } catch (e) {
    console.error("Failed to fetch Gemini key:", e);
    cachedGeminiKey = null;
  }
  return cachedGeminiKey;
}

export async function getAISettings() {
  if (cachedSettings) return cachedSettings;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("ai_settings")
      .select("default_model, vision_model, recommendation_model")
      .limit(1)
      .maybeSingle();

    cachedSettings = data || {
      default_model: "gemini-1.5-flash",
      vision_model: "gemini-1.5-pro",
      recommendation_model: "gemini-1.5-pro",
    };
  } catch {
    cachedSettings = {
      default_model: "gemini-1.5-flash",
      vision_model: "gemini-1.5-pro",
      recommendation_model: "gemini-1.5-pro",
    };
  }
  return cachedSettings!;
}

export async function createAIProvider(): Promise<AIProvider> {
  const geminiKey = await getGeminiKey();
  const settings = await getAISettings();
  
  if (geminiKey) {
    // Use direct Gemini API when configured
    return createGeminiProvider(geminiKey, settings);
  } else {
    // Fall back to Lovable AI Gateway
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      throw new Error("No AI provider available. Configure Gemini API key in Admin → Settings or ensure Lovable AI is enabled.");
    }
    return createLovableProvider(lovableKey, settings);
  }
}

function mapRole(role: string): string {
  if (role === "system") return "user"; // Gemini doesn't have system role, prepend as user
  if (role === "assistant") return "model";
  return "user";
}

function buildGeminiContents(messages: { role: string; content: string | any[] }[]) {
  const contents: any[] = [];
  let systemText = "";

  for (const msg of messages) {
    if (msg.role === "system") {
      systemText += (typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)) + "\n";
      continue;
    }

    const role = mapRole(msg.role);
    const text = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);

    // If first user message, prepend system context
    if (role === "user" && systemText && contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: `${systemText}\n\n${text}` }],
      });
      systemText = "";
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  // If only system messages, add as user
  if (systemText && contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: systemText }] });
  }

  return contents;
}

function createGeminiProvider(apiKey: string, settings: any): AIProvider {
  const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

  return {
    async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
      const model = params.model || settings.default_model || "gemini-1.5-flash";
      const contents = buildGeminiContents(params.messages);

      const body: any = {
        contents,
        generationConfig: {
          temperature: params.temperature ?? 0.7,
        },
      };

      if (params.responseSchema) {
        body.generationConfig.responseMimeType = "application/json";
        body.generationConfig.responseSchema = params.responseSchema;
      }

      const response = await fetch(
        `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429) throw new AIError("Rate limited by Gemini", 429);
        if (response.status === 403 || response.status === 401) throw new AIError("Gemini API key invalid", 402);
        throw new AIError(`Gemini error: ${response.status} ${errText}`, response.status);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let parsed: any = undefined;
      if (params.responseSchema) {
        try {
          parsed = JSON.parse(text);
        } catch {
          // Try to extract JSON from text
          const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch {}
          }
        }
      }

      return { text, parsed };
    },

    async generateEmbedding(text: string): Promise<number[]> {
      const response = await fetch(
        `${GEMINI_BASE}/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new AIError(`Gemini embedding error: ${response.status} ${errText}`, response.status);
      }

      const data = await response.json();
      return data.embedding?.values || [];
    },

    async analyzeImage(params: ImageAnalysisParams): Promise<string> {
      const model = params.model || settings.vision_model || "gemini-1.5-pro";

      const response = await fetch(
        `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [
                { inlineData: { mimeType: params.mimeType, data: params.imageBase64 } },
                { text: params.prompt },
              ],
            }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new AIError(`Gemini vision error: ${response.status} ${errText}`, response.status);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

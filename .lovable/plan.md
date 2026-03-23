

## Plan: Remove Lovable AI Dependency, Use Only Gemini API

The app currently has two AI pathways:
1. **Shared `ai-provider.ts`** — already prioritizes Gemini, falls back to Lovable AI (used by most edge functions)
2. **3 edge functions that call Lovable AI directly** — bypassing the shared provider entirely

### Changes Required

#### 1. Update `_shared/ai-provider.ts` — Remove Lovable fallback
- In `createAIProvider()`, remove the Lovable AI fallback block
- If no Gemini key is configured, throw a clear error: "Configure Gemini API key in Admin → Settings"
- Delete the entire `createLovableProvider` function and related helpers (`toLovableModel`)

#### 2. Rewrite `food-assistant/index.ts` — Use shared AI provider
- Replace direct Lovable AI gateway call with `createAIProvider()` from `_shared/ai-provider.ts`
- Use `ai.chatCompletion()` instead of raw `fetch` to the gateway
- Keep the same system prompt, suggestion parsing, and error handling

#### 3. Rewrite `ai-moderate-community-post/index.ts` — Use shared AI provider
- Replace direct Lovable AI gateway call with `createAIProvider()`
- Use `ai.chatCompletion()` with the existing moderation prompt
- Keep the same DB update logic and fallback-to-pending behavior

#### 4. Rewrite `ai-trending-topics/index.ts` — Use shared AI provider
- Replace direct Lovable AI gateway call with `createAIProvider()`
- Use `ai.chatCompletion()` instead of raw `fetch`
- Keep the same tool-calling prompt (will need to adapt since Gemini uses different structured output)

#### 5. Deploy all 4 changed edge functions

### Result
- All AI features will require the Gemini API key from Admin → Settings
- No dependency on Lovable AI credits
- Until you add the Gemini key, AI features will gracefully degrade (existing error handling returns fallback data)


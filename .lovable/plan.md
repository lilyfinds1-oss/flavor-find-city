

# Plan: AI-Driven Discovery Feed, Semantic Search, and Auto-Moderation

Three new AI capabilities that replace mock/keyword logic with intelligent, personalized experiences.

---

## 1. AI-Driven Discovery Feed

**Current state:** `DiscoveryFeed.tsx` renders hardcoded `mockFeedItems`. No real data.

**Approach:** Create a new edge function `ai-discovery-feed` that:
- Accepts: user ID (optional), active filter (for_you/trending/hot/new), page number
- Fetches real restaurants from DB (with trending scores, ratings, recent reviews count)
- Fetches user's saved restaurants + past review history (if authenticated) for personalization context
- Fetches active deals and recent blog posts to mix into the feed
- Calls Lovable AI (`google/gemini-2.5-flash-lite` — fast/cheap for classification) with restaurant data + user context, asking it to rank and annotate items with AI context reasons (e.g., "Popular in your area", "Matches your taste for BBQ")
- Returns structured feed items with AI-generated `aiContext` for each

**Frontend changes:**
- Replace mock data in `DiscoveryFeed.tsx` with a new `useDiscoveryFeed` hook that calls the edge function
- Pass the active filter tab to the hook
- Handle loading/error states with the existing skeleton UI
- Add pagination via "Load more" button

**Files to create/edit:**
- `supabase/functions/ai-discovery-feed/index.ts` (new)
- `src/hooks/useDiscoveryFeed.ts` (new)
- `src/components/discover/DiscoveryFeed.tsx` (replace mock data with hook)
- `supabase/config.toml` (add function config)

---

## 2. AI-Powered Semantic Search

**Current state:** `GlobalSearch.tsx` and `useRestaurants` use `.ilike` text matching on name/neighborhood/address fields only.

**Approach:** Create an edge function `ai-search` that:
- Accepts: natural language query string
- Fetches all active restaurants from DB (id, name, slug, neighborhood, cuisines, price_range, average_rating, cover_image, is_halal, has_delivery, signature_dishes, description)
- Sends query + restaurant list to Lovable AI (`google/gemini-2.5-flash`) with a prompt to rank and filter restaurants semantically, returning ordered IDs with match reasons
- Returns ranked results with AI-generated match explanations

**Frontend changes:**
- Update `GlobalSearch.tsx`: after 500ms debounce, if query looks like natural language (>3 words or contains descriptive terms), call the AI search edge function instead of direct Supabase query; fall back to keyword search for simple queries
- Show AI match reasons alongside each result
- Update `Explore.tsx` search: add an "AI Search" toggle/badge; when active, route searches through the AI function instead of `useRestaurants`

**Files to create/edit:**
- `supabase/functions/ai-search/index.ts` (new)
- `src/hooks/useAISearch.ts` (new)
- `src/components/search/GlobalSearch.tsx` (add AI search path)
- `src/pages/Explore.tsx` (integrate AI search option)
- `supabase/config.toml` (add function config)

---

## 3. AI Auto-Moderation for Reviews

**Current state:** Reviews insert with `status: 'approved'` by default. Manual moderation in admin panel.

**Approach:** 

**Database change:** Update default review status from `'approved'` to `'pending'` so new reviews go through moderation. Add columns `ai_quality_score` (integer, nullable) and `ai_moderation_notes` (text, nullable) to the reviews table.

**Edge function** `ai-moderate-review`:
- Accepts: review content, title, rating, restaurant name
- Calls Lovable AI (`google/gemini-2.5-flash`) with a moderation prompt asking to evaluate: spam detection, inappropriate content, quality score (1-100), and a recommendation (approve/flag/reject) with reasoning
- Uses tool calling for structured output
- Returns: `{ recommendation, quality_score, notes }`

**Integration:** After review insert in `ReviewForm.tsx`, invoke the moderation function. If AI recommends "approve" with high confidence (score >= 70), auto-approve by updating status to 'approved'. Otherwise, leave as 'pending' for manual review.

**Admin enhancement:** Show AI quality score and moderation notes in `ReviewModerator.tsx` to help admins make faster decisions.

**Files to create/edit:**
- Migration: alter `reviews` table (add columns, change default status)
- `supabase/functions/ai-moderate-review/index.ts` (new)
- `src/components/reviews/ReviewForm.tsx` (call moderation after insert)
- `src/components/admin/ReviewModerator.tsx` (display AI scores/notes)
- `supabase/config.toml` (add function config)

---

## Technical Notes

- All three edge functions use `LOVABLE_API_KEY` (already configured) to call Lovable AI Gateway
- All functions set `verify_jwt = false` in config.toml with manual auth checks where needed
- Rate limit (429) and credit (402) errors are caught and surfaced to users via toasts
- The discovery feed and search use lighter/faster models (`flash-lite` and `flash`) to keep latency low
- The moderation function runs asynchronously after review submission so the user isn't blocked


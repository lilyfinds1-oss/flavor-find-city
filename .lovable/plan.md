
## Codebase Audit: Issues Found

After reviewing the app comprehensively, I found **4 remaining hardcoded location references** that need to be fixed:

### 1. Hardcoded "Lahore" in Frontend (3 files)

**src/pages/Leaderboard.tsx** (lines 35, 67)
- SEOHead description says "See the top foodies in **Lahore**..."
- Should be dynamic using city context

**src/pages/Assistant.tsx** (lines 28, 39, 110)
- Quick prompt: "Best biryani in **Lahore**"
- Intro message: "...I'll find the perfect spot for you in **Lahore**"
- SEOHead description: "...recommendations in **Lahore** based on..."
- Should use `useCity()` hook for dynamic city name

### 2. Hardcoded "Toronto" in Edge Function

**supabase/functions/food-assistant/index.ts** (lines 23, 28)
- Restaurant context says "Available restaurants in **Toronto**"
- System prompt says "...restaurant discovery app in **Toronto**"
- Should accept city parameter from frontend or use "Pakistan" generically

### 3. Hardcoded "Lahore" in Edge Function

**supabase/functions/ai-generate-restaurant-description/index.ts** (line 54)
- System prompt says "...discovery platform in **Lahore, Pakistan**"
- Should use the restaurant's city field or "Pakistan" generically

---

## Proposed Fixes

### Frontend Pages (Assistant.tsx, Leaderboard.tsx)
- Import and use `useCity()` hook
- Replace hardcoded "Lahore" with `city?.name || "Pakistan"`

### Edge Functions (food-assistant, ai-generate-restaurant-description)
- **food-assistant**: Accept optional `city` param from request body; update prompt to use it
- **ai-generate-restaurant-description**: Use the restaurant's city from the database

---

## Technical Summary

| File | Issue | Fix |
|------|-------|-----|
| `src/pages/Leaderboard.tsx` | "Lahore" in SEO | Use `useCity()` |
| `src/pages/Assistant.tsx` | "Lahore" in SEO, prompts, intro | Use `useCity()` |
| `food-assistant/index.ts` | "Toronto" in prompts | Accept city param |
| `ai-generate-restaurant-description/index.ts` | "Lahore" in prompt | Use restaurant.city |

Everything else looks good - navigation links work, map centers correctly on city switch, deals/restaurants filter by city, and the UI is responsive.

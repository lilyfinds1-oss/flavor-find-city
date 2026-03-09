

# Remaining Improvements for CityBites

After auditing the current codebase, here is what is still missing or would add significant value, grouped by priority.

---

## Quick Wins (Small effort, noticeable impact)

### 1. Global Error Boundary
No error boundary exists. A crash in any component takes down the entire app. Add a React error boundary wrapper in `App.tsx` with a user-friendly fallback ("Something went wrong" + reload button).

### 2. SEO Meta Tags on Missing Pages
`SEOHead` is used on Blog/Auth/RestaurantDetail but missing from: Deals, Leaderboard, Map, Top Posts, Profile, Assistant, AI Tools Dashboard. Add `<SEOHead>` with proper titles/descriptions to each.

### 3. Restaurant Form City Default Fix
`RestaurantForm.tsx` defaults city to `"Toronto"` (line 41). Should be `"Lahore"`.

### 4. Empty State for Deals Page
Deals page shows nothing when no deals exist. Add a friendly empty state with a CTA.

### 5. Empty State for Top Posts
Similar — if no approved reviews exist for a month, the page is blank.

---

## Medium Priority (Engagement & Growth)

### 6. Google OAuth Sign-In
Currently email/password only. Add Google OAuth button on the Auth page. Requires enabling Google provider in auth config and adding a "Sign in with Google" button.

### 7. Onboarding Flow for New Users
After signup, users land on homepage with no guidance. Create a lightweight onboarding modal/wizard (pick 2-3 favorite cuisines, select neighborhood) that saves preferences to the `profiles` table (add `favorite_cuisines` and `preferred_neighborhoods` columns). This feeds into AI personalization.

### 8. Review Submission for All Users
Currently, only users with `writer`, `moderator`, or `admin` roles can submit reviews (RLS policy). Regular users cannot review restaurants. Either:
- Auto-assign `writer` role on signup, OR
- Add a less restrictive INSERT policy for authenticated users

This is a **critical gap** — most users signing up will not be able to leave reviews.

### 9. Skeleton Loaders
Replace generic spinners with content-shaped skeleton loaders on: Explore grid, Restaurant Detail, Deals grid, Leaderboard list. Use the existing `Skeleton` component from `src/components/ui/skeleton.tsx`.

---

## Lower Priority (Polish)

### 10. Offline Support / PWA Caching
PWA config exists (`vite-plugin-pwa`) but service worker caching strategy isn't configured. Add runtime caching for restaurant data and images for offline browsing.

### 11. Dark Mode Image Handling
Some hardcoded Unsplash images may look odd in dark mode. Add subtle overlays or ensure cover images have consistent treatment.

### 12. Rate Limiting on Auth
No client-side rate limiting on login/signup attempts. Add a simple cooldown after 3 failed attempts.

---

## Summary

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| 1 | Error Boundary | High | Tiny |
| 2 | SEO tags on all pages | Medium | Small |
| 3 | Fix city default to Lahore | Low | Tiny |
| 4-5 | Empty states (Deals, Top Posts) | Medium | Small |
| 6 | Google OAuth | High | Medium |
| 7 | Onboarding wizard | Medium | Medium |
| **8** | **Fix review RLS for regular users** | **Critical** | **Small** |
| 9 | Skeleton loaders | Medium | Medium |
| 10 | PWA offline caching | Low | Medium |

**Recommendation**: Start with #8 (review permissions fix — this is a blocker for normal users), then batch #1-5 (quick wins), then #6-7 (growth features).


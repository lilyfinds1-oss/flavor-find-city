

## App Audit: Current State and Enhancement Ideas

### Issues Found

1. **Dead footer links** — The footer has links to pages that don't exist: `/lists/biryani`, `/lists/date-night`, `/lists/late-night`, `/lists/hidden-gems`, `/lists/bbq`, `/about`, `/for-restaurants`, `/careers`, `/contact`. Clicking any of these leads to the 404 page.

2. **No errors in console** — The app is running cleanly with no runtime errors.

### Enhancement Ideas (Ranked by Impact)

#### 1. Curated Lists Pages (fixes dead links + adds content)
Create a `/lists/:slug` route that shows curated restaurant collections (Best Biryani, Date Night, Late Night, Hidden Gems, Best BBQ). Each list filters restaurants by tags/cuisines. This fixes the 5 broken footer links and adds a high-engagement feature.

#### 2. "About" and Static Pages (fixes dead links)
Create simple static pages for `/about`, `/for-restaurants`, `/careers`, `/contact` so the footer links work. These are standard for any production app.

#### 3. Social Login (Google Sign-In)
Add Google OAuth to the auth page. Reduces friction for signups significantly. The backend already supports it — just needs frontend integration and auth config.

#### 4. Restaurant Comparison Tool
Let users compare 2-3 restaurants side-by-side (rating, price, cuisines, reviews). A unique differentiator for a food discovery platform.

#### 5. "Near Me" Location-Based Discovery
Use browser geolocation to sort/filter restaurants by distance from the user. Especially useful on mobile.

#### 6. Weekly Email Digest
The `weekly-digest` edge function already exists but isn't connected to a trigger. Wire it up so subscribed users get a weekly email with new restaurants, top posts, and deals.

#### 7. Dark Mode Polish
The app has a theme toggle, but verifying all components render correctly in dark mode (cards, forms, maps) would polish the experience.

---

## Recommended First Steps

I'd suggest tackling **items 1 and 2 first** since they fix broken links that exist right now in the footer. Then **item 3 (Google login)** for user growth.

### Technical Plan for Items 1-2

**Curated Lists (`/lists/:slug`)**
- Create `src/pages/CuratedList.tsx` — accepts slug param, maps to tag/cuisine filter
- Query restaurants table filtered by `tags` or `cuisines` matching the list theme
- Add route to `App.tsx`

**Static Pages**
- Create `src/pages/About.tsx`, `src/pages/ForRestaurants.tsx`, `src/pages/Contact.tsx`
- Simple informational pages with Header/Footer
- Add routes to `App.tsx`

| Change | Files |
|--------|-------|
| Curated lists page | New `CuratedList.tsx`, edit `App.tsx` |
| About page | New `About.tsx`, edit `App.tsx` |
| For Restaurants page | New `ForRestaurants.tsx`, edit `App.tsx` |
| Contact page | New `Contact.tsx`, edit `App.tsx` |




# Recommended Additions for CityBites

Based on a thorough review of the codebase, here is what is missing or could be improved, organized by impact:

---

## High Priority -- Core UX Gaps

### 1. Email Verification UX (already flagged as pending)
After signup, users get no feedback about email verification. Add a "Check your email" banner on the Auth page post-signup, with a resend verification button.

### 2. Saved Restaurants Page
Users can save restaurants but there is **no page to view their saved list**. The Profile page shows stats but doesn't list saved restaurants. Add a "My Saved" section or tab on the Profile page that queries `saved_restaurants` and renders `RestaurantCard` components.

### 3. Password Reset Flow
There is no "Forgot Password" link on the Auth page. Add a forgot password form that calls `supabase.auth.resetPasswordForEmail()` and a password update page.

### 4. Empty State Handling
Several pages (Deals, Leaderboard, Blog) may show blank screens when data is empty. Add friendly empty states with calls-to-action.

---

## Medium Priority -- Engagement & Retention

### 5. User Review History on Profile
The Profile page shows `total_reviews` count but doesn't display the user's actual reviews. Add a "My Reviews" section fetching from the `reviews` table filtered by `user_id`.

### 6. Neighborhood Filtering on Explore/Map
The Explore page has cuisine and price filters but no **neighborhood dropdown**. The data exists (`neighborhood` column on restaurants). Wire it up as a filter.

### 7. Push Notification Triggers
`PushNotificationToggle` component exists but there are no backend triggers sending notifications when, e.g., a deal goes live, a review gets approved, or XP is earned. Add edge functions or database triggers to create entries in the `notifications` table for key events.

### 8. Social Sharing for Restaurants
`ShareReview` exists but there is no share button on the restaurant detail page hero. Add Web Share API / copy-link for restaurant pages.

---

## Lower Priority -- Polish & Growth

### 9. Onboarding Flow for New Users
After signup, users land on the homepage with no guidance. A brief onboarding wizard (pick favorite cuisines, neighborhoods) would improve personalization and the AI recommendations.

### 10. Google OAuth Sign-In
Currently only email/password auth. Adding Google OAuth would reduce signup friction significantly, especially for mobile users.

### 11. Restaurant Photo Gallery
Restaurant detail pages show a single `cover_image`. The `photos` array column exists but isn't rendered. Add a photo gallery/lightbox.

### 12. Admin Analytics -- Real Charts
The `AnalyticsDashboard` component exists but likely uses placeholder data. Connect it to real queries (signups over time, reviews per week, top restaurants by engagement).

---

## Technical Debt

### 13. No Global Error Boundary
If a component crashes, the whole app goes white. Add a React error boundary with a user-friendly fallback.

### 14. No Loading Skeletons
Most pages show a spinner while loading. Replace with skeleton loaders for a more polished feel.

### 15. SEO -- Missing Meta Tags on Several Pages
`SEOHead` component exists but isn't used on all pages (Deals, Leaderboard, Map, etc.).

---

## Summary Table

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| 1 | Email Verification UX | High | Small |
| 2 | Saved Restaurants Page | High | Small |
| 3 | Password Reset Flow | High | Small |
| 4 | Empty State Handling | Medium | Small |
| 5 | User Review History | Medium | Small |
| 6 | Neighborhood Filter | Medium | Small |
| 7 | Push Notification Triggers | Medium | Medium |
| 8 | Social Sharing for Restaurants | Medium | Small |
| 9 | Onboarding Flow | Medium | Medium |
| 10 | Google OAuth | High | Medium |
| 11 | Restaurant Photo Gallery | Low | Small |
| 12 | Real Analytics Charts | Low | Medium |
| 13 | Error Boundary | Medium | Small |
| 14 | Skeleton Loaders | Low | Medium |
| 15 | SEO Meta Tags | Low | Small |

Pick any of these to tackle next, or I can implement a batch of the quick wins (1-6) together.


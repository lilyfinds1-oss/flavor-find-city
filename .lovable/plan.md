
# CityBites Launch Readiness Plan

## Overview
This plan addresses the gaps between the current implementation and a testable product for Lahore, Pakistan. We'll focus on making the core user journeys functional with real data.

---

## Phase 1: Data Corrections

### 1.1 Update Restaurant Coordinates for Lahore
Update all existing restaurants with Lahore coordinates and Lahore neighborhoods.

**Technical Details:**
- Run SQL migration to update restaurants table
- Change city from "Toronto" to "Lahore"
- Update neighborhoods to Lahore areas (Gulberg, DHA, Johar Town, Model Town, etc.)
- Set coordinates within Lahore bounds (31.5204° N, 74.3587° E center)

### 1.2 Seed Real Deals Data
Populate the deals table with sample promotional offers.

**Technical Details:**
- Insert 6-8 sample deals linked to existing restaurants
- Include variety of deal types (percentage, fixed, bogo, freebie)
- Set appropriate XP costs and expiration dates

---

## Phase 2: Core Feature Completion

### 2.1 Integrate Reviews into Restaurant Detail Page
Connect the ReviewForm and ReviewVoteButton components to the restaurant detail page.

**Technical Details:**
- Import ReviewForm and ReviewVoteButton into RestaurantDetail.tsx
- Fetch reviews for the current restaurant using a new useRestaurantReviews hook
- Display reviews with voting capability
- Show ReviewForm at the bottom

### 2.2 Implement Save to Favorites
Make the heart/save button functional.

**Technical Details:**
- Create useSavedRestaurants hook (toggle save, check if saved)
- Update RestaurantDetail and RestaurantCard to use hook
- Show saved state in UI with filled/unfilled heart

### 2.3 Implement Get Directions
Link to Google Maps/Apple Maps for navigation.

**Technical Details:**
- Add onClick handler to open maps URL with restaurant coordinates
- Use `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` format

### 2.4 Connect Deals Page to Database
Replace hardcoded deals with real database queries.

**Technical Details:**
- Create useDeals hook to fetch from deals table
- Display user's XP balance (from profile)
- Implement deal redemption (insert into deal_redemptions)
- Add XP validation before redemption

---

## Phase 3: Admin Tools

### 3.1 User Role Management Panel
Add a section in admin dashboard to assign roles to users.

**Technical Details:**
- Create UserRoleManager component
- List profiles with current roles
- Allow admins to add/remove writer role
- Use user_roles table

### 3.2 Deals Management Panel
Add deals CRUD to admin dashboard.

**Technical Details:**
- Create DealsManager component
- Form for creating/editing deals
- Link deals to restaurants

---

## Phase 4: Dynamic Data

### 4.1 Real Leaderboard
Replace mock leaderboard with real profile data.

**Technical Details:**
- Create useLeaderboard hook
- Query profiles ordered by xp_points DESC
- Limit to top 20 users

---

## Phase 5: UX Polish

### 5.1 Fix City References
Update all "Toronto" references to "Lahore".

**Files to update:**
- src/pages/Explore.tsx (line 69)
- src/pages/Top100.tsx (line 34, 78)
- src/pages/Leaderboard.tsx (line 55)
- src/components/map/SettingsPanel.tsx (line 72)

### 5.2 Email Verification UX
Show clear message for users with unverified email.

**Technical Details:**
- Check email_confirmed_at in auth state
- Show "Check your email" banner on protected pages
- Add resend verification email button

---

## Implementation Priority

```text
+-----------------------------------------------------+
|                    CRITICAL PATH                    |
+-----------------------------------------------------+
|                                                     |
|  Phase 1.1: Lahore Data  ──────────────────────────►|
|        │                                            |
|        ▼                                            |
|  Phase 2.1: Reviews Integration  ──────────────────►|
|        │                                            |
|        ▼                                            |
|  Phase 5.1: Fix City References  ──────────────────►|
|        │                                            |
|        ▼                                            |
|       ✓ TESTABLE MVP                                |
|                                                     |
+-----------------------------------------------------+
|                   NICE TO HAVE                      |
+-----------------------------------------------------+
|                                                     |
|  Phase 2.2-2.4: Favorites, Directions, Deals       |
|  Phase 3: Admin Tools                              |
|  Phase 4: Real Leaderboard                         |
|  Phase 5.2: Email UX                               |
|                                                     |
+-----------------------------------------------------+
```

---

## Database Changes Required

### Migration 1: Update Restaurant Locations
```sql
-- Update restaurants to Lahore coordinates and neighborhoods
UPDATE restaurants SET 
  city = 'Lahore',
  -- Coordinates and neighborhoods will be randomized per restaurant
```

### Migration 2: Seed Deals
```sql
-- Insert sample deals linked to existing restaurants
INSERT INTO deals (restaurant_id, title, deal_type, ...)
```

---

## New Files to Create

| File | Purpose |
|------|---------|
| src/hooks/useRestaurantReviews.ts | Fetch reviews for a restaurant |
| src/hooks/useSavedRestaurants.ts | Manage saved restaurants |
| src/hooks/useDeals.ts | Fetch and redeem deals |
| src/hooks/useLeaderboard.ts | Fetch top users by XP |
| src/components/admin/UserRoleManager.tsx | Assign writer roles |
| src/components/admin/DealsManager.tsx | CRUD for deals |

---

## Files to Modify

| File | Changes |
|------|---------|
| src/pages/RestaurantDetail.tsx | Add reviews, favorites, directions |
| src/pages/Deals.tsx | Connect to database |
| src/pages/Leaderboard.tsx | Use real data |
| src/pages/Explore.tsx | Fix city name |
| src/pages/Top100.tsx | Fix city name |
| src/pages/Admin.tsx | Add Users tab |
| src/components/restaurant/RestaurantCard.tsx | Add save functionality |

---

## Estimated Scope

- **Database migrations:** 2 migrations
- **New hooks:** 4 hooks
- **New components:** 2 components  
- **Modified files:** ~10 files
- **Edge functions:** None needed (existing food-assistant works)

---

## Recommendation

For a quick testing launch, I recommend focusing on:

1. **Lahore data migration** - Critical for the Map and location-based features
2. **Reviews integration** - Core feature for community engagement
3. **City name fixes** - Consistent branding

The favorites, deals redemption, and admin role management can follow as Phase 2 enhancements after initial testing feedback.

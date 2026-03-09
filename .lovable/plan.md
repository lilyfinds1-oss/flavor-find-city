# CityBites Launch Readiness Plan

## Overview
This plan addresses the gaps between the current implementation and a testable product for Lahore, Pakistan.

---

## ✅ Phase 1: Data Corrections — COMPLETE

### 1.1 ✅ Update Restaurant Coordinates for Lahore
All 20 restaurants updated with:
- City: Lahore
- Neighborhoods: Gulberg, DHA Phase 5, Johar Town, Model Town, etc.
- Latitude/Longitude within Lahore bounds

### 1.2 ✅ Seed Real Deals Data
6 deals seeded and linked to restaurants:
- The Smokehouse BBQ: 20% Off (500 XP)
- Spice Garden: BOGO Biryani (750 XP)
- Sakura Sushi: Free Miso Soup (200 XP)
- Mediterranean Grill: Rs. 500 Off (600 XP)
- Nonna Rosa Trattoria: 15% Off Italian (400 XP)
- Seoul Kitchen: Free Korean Fried Chicken (850 XP)

---

## ✅ Phase 2: Core Feature Completion — COMPLETE

### 2.1 ✅ Integrate Reviews into Restaurant Detail Page
- Created `useRestaurantReviews.ts` hook
- Integrated `ReviewForm` and `ReviewVoteButton` components
- Reviews display with author avatars and voting

### 2.2 🔲 Implement Save to Favorites
 ### 2.2 ✅ Implement Save to Favorites
 - Created `useSavedRestaurants.ts` hook with:
   - `useSavedRestaurants()` - Fetch user's saved restaurants
   - `useIsSaved()` - Check if a restaurant is saved
   - `useToggleSave()` - Toggle save/unsave with optimistic UI
 - Integrated into RestaurantDetail page with filled heart for saved state

### 2.3 ✅ Implement Get Directions
- Added `handleGetDirections` function
- Opens Google Maps with restaurant coordinates

### 2.4 ✅ Connect Deals Page to Database
- Created `useDeals.ts` hook with:
  - `useDeals()` - Fetch active deals
  - `useUserXP()` - Get user's XP balance
  - `useRedeemDeal()` - Handle redemption with XP deduction
- Updated Deals page to use real data

---

## 🔲 Phase 3: Admin Tools — PENDING

 ## ✅ Phase 3: Admin Tools — COMPLETE

 ### 3.1 ✅ User Role Management Panel
 - Created `UserRoleManager.tsx` component
 - Lists profiles with current roles
 - Allows admins to add/remove writer and moderator roles
 - Search functionality included
 
 ### 3.2 ✅ Deals Management Panel
 - Created `DealsManager.tsx` component
 - Full CRUD for deals with dialog form
 - Linked to restaurants with selector

---

## 🔲 Phase 4: Dynamic Data — PENDING

 ## ✅ Phase 4: Dynamic Data — COMPLETE
 
 ### 4.1 ✅ Real Leaderboard
 - Created `useLeaderboard.ts` hook
 - Queries profiles ordered by xp_points DESC
 - Dynamic badge assignment based on XP thresholds
 - Supports user avatars with fallback emojis

---

## ✅ Phase 5: UX Polish — COMPLETE

### 5.1 ✅ Fix City References
Updated to "Lahore" in:
- src/pages/Explore.tsx
- src/pages/Top100.tsx
- src/pages/Leaderboard.tsx
- src/pages/RestaurantDetail.tsx (city rank badge)

Note: SettingsPanel.tsx already references Lahore

### 5.2 🔲 Email Verification UX — PENDING
- Show "Check your email" banner
- Add resend verification button

---

## Current Status: TESTABLE MVP ✅

The critical path is complete:
1. ✅ Restaurants have Lahore coordinates for Map functionality
2. ✅ Reviews are integrated with voting
3. ✅ City references updated to Lahore
4. ✅ Deals page connected to real database
5. ✅ Get Directions works
 6. ✅ Save to Favorites works
 7. ✅ Admin User Role Manager implemented
 8. ✅ Admin Deals Manager implemented
 9. ✅ Real Leaderboard with database data

**Ready for initial testing!**

---

## Remaining Nice-to-Have Items

| Feature | Priority | Effort |
|---------|----------|--------|
| Email Verification UX | Low | ~1 hour |

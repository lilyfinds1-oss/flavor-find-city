 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 export interface LeaderboardUser {
   id: string;
   username: string | null;
   display_name: string | null;
   avatar_url: string | null;
   xp_points: number;
   total_reviews: number;
   is_verified_foodie: boolean | null;
 }
 
 export function useLeaderboard(limit: number = 20) {
   return useQuery({
     queryKey: ["leaderboard", limit],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("profiles")
         .select("id, username, display_name, avatar_url, xp_points, total_reviews, is_verified_foodie")
         .order("xp_points", { ascending: false })
         .limit(limit);
 
       if (error) throw error;
       return data as LeaderboardUser[];
     },
   });
 }
 
 export function getBadgeFromXP(xp: number): string {
   if (xp >= 10000) return "Legend";
   if (xp >= 5000) return "Expert";
   if (xp >= 2000) return "Pro";
   if (xp >= 500) return "Rising";
   return "Active";
 }
 
 export function getAvatarEmoji(index: number): string {
   const emojis = ["👑", "🍕", "🌶️", "🥞", "🍣", "🍖", "☕", "🌮", "🍰", "🥗", "🍜", "🥡", "🍱", "🥐", "🍔"];
   return emojis[index % emojis.length];
 }
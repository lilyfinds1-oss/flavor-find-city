 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 
 export function useSavedRestaurants() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["saved-restaurants", user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from("saved_restaurants")
         .select(`
           id,
           restaurant_id,
           created_at,
           restaurant:restaurants!saved_restaurants_restaurant_id_fkey (
             id,
             name,
             slug,
             cover_image,
             neighborhood,
             cuisines,
             price_range,
             average_rating
           )
         `)
         .eq("user_id", user.id)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data;
     },
     enabled: !!user,
   });
 }
 
 export function useIsSaved(restaurantId: string) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["is-saved", restaurantId, user?.id],
     queryFn: async () => {
       if (!user) return false;
 
       const { data, error } = await supabase
         .from("saved_restaurants")
         .select("id")
         .eq("user_id", user.id)
         .eq("restaurant_id", restaurantId)
         .maybeSingle();
 
       if (error) return false;
       return !!data;
     },
     enabled: !!user && !!restaurantId,
   });
 }
 
 export function useToggleSave() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({ restaurantId, isSaved }: { restaurantId: string; isSaved: boolean }) => {
       if (!user) throw new Error("Not authenticated");
 
       if (isSaved) {
         // Remove from saved
         const { error } = await supabase
           .from("saved_restaurants")
           .delete()
           .eq("user_id", user.id)
           .eq("restaurant_id", restaurantId);
 
         if (error) throw error;
         return { action: "removed" };
       } else {
         // Add to saved
         const { error } = await supabase
           .from("saved_restaurants")
           .insert({
             user_id: user.id,
             restaurant_id: restaurantId,
           });
 
         if (error) throw error;
         return { action: "saved" };
       }
     },
     onSuccess: (result, { restaurantId }) => {
       toast.success(result.action === "saved" ? "Added to favorites!" : "Removed from favorites");
       queryClient.invalidateQueries({ queryKey: ["saved-restaurants"] });
       queryClient.invalidateQueries({ queryKey: ["is-saved", restaurantId] });
     },
     onError: (error: Error) => {
       toast.error(error.message || "Failed to update favorites");
     },
   });
 }
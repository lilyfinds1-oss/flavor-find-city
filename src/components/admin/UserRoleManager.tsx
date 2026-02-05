 import { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { toast } from "sonner";
 import { Search, UserPlus, Shield, Trash2, Loader2 } from "lucide-react";
 import type { Database } from "@/integrations/supabase/types";
 
 type AppRole = Database["public"]["Enums"]["app_role"];
 
 interface ProfileWithRoles {
   id: string;
   username: string | null;
   display_name: string | null;
   avatar_url: string | null;
   roles: AppRole[];
 }
 
 export default function UserRoleManager() {
   const [searchTerm, setSearchTerm] = useState("");
   const queryClient = useQueryClient();
 
   const { data: profiles, isLoading } = useQuery({
     queryKey: ["admin-profiles"],
     queryFn: async () => {
       // Fetch profiles
       const { data: profilesData, error: profilesError } = await supabase
         .from("profiles")
         .select("id, username, display_name, avatar_url")
         .order("created_at", { ascending: false })
         .limit(50);
 
       if (profilesError) throw profilesError;
 
       // Fetch all roles
       const { data: rolesData, error: rolesError } = await supabase
         .from("user_roles")
         .select("user_id, role");
 
       if (rolesError) throw rolesError;
 
       // Merge profiles with their roles
       const profilesWithRoles: ProfileWithRoles[] = profilesData.map((profile) => ({
         ...profile,
         roles: rolesData
           .filter((r) => r.user_id === profile.id)
           .map((r) => r.role as AppRole),
       }));
 
       return profilesWithRoles;
     },
   });
 
   const addRole = useMutation({
     mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
       const { error } = await supabase
         .from("user_roles")
         .insert({ user_id: userId, role });
 
       if (error) throw error;
     },
     onSuccess: () => {
       toast.success("Role added successfully");
       queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
     },
     onError: (error: Error) => {
       toast.error(error.message || "Failed to add role");
     },
   });
 
   const removeRole = useMutation({
     mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
       const { error } = await supabase
         .from("user_roles")
         .delete()
         .eq("user_id", userId)
         .eq("role", role);
 
       if (error) throw error;
     },
     onSuccess: () => {
       toast.success("Role removed successfully");
       queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
     },
     onError: (error: Error) => {
       toast.error(error.message || "Failed to remove role");
     },
   });
 
   const filteredProfiles = profiles?.filter(
     (p) =>
       p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getRoleBadgeColor = (role: AppRole) => {
     switch (role) {
       case "admin":
         return "bg-destructive text-destructive-foreground";
       case "moderator":
         return "bg-amber text-charcoal";
       case "writer":
         return "bg-success text-success-foreground";
       default:
         return "bg-secondary text-secondary-foreground";
     }
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Shield className="w-5 h-5" />
             User Role Management
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Search users..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
             />
           </div>
 
           <div className="space-y-3">
             {filteredProfiles?.map((profile) => (
               <div
                 key={profile.id}
                 className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
               >
                 <Avatar className="w-10 h-10">
                   <AvatarImage src={profile.avatar_url || undefined} />
                   <AvatarFallback>
                     {profile.display_name?.charAt(0) || "U"}
                   </AvatarFallback>
                 </Avatar>
 
                 <div className="flex-1 min-w-0">
                   <p className="font-medium truncate">
                     {profile.display_name || profile.username || "Unknown User"}
                   </p>
                   <p className="text-sm text-muted-foreground truncate">
                     @{profile.username || "no-username"}
                   </p>
                 </div>
 
                 <div className="flex items-center gap-2 flex-wrap">
                   {profile.roles.map((role) => (
                     <Badge
                       key={role}
                       className={`${getRoleBadgeColor(role)} cursor-pointer group`}
                       onClick={() => removeRole.mutate({ userId: profile.id, role })}
                     >
                       {role}
                       <Trash2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </Badge>
                   ))}
                 </div>
 
                 <div className="flex items-center gap-1">
                   {!profile.roles.includes("writer") && (
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => addRole.mutate({ userId: profile.id, role: "writer" })}
                       disabled={addRole.isPending}
                     >
                       <UserPlus className="w-3 h-3 mr-1" />
                       Writer
                     </Button>
                   )}
                   {!profile.roles.includes("moderator") && (
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => addRole.mutate({ userId: profile.id, role: "moderator" })}
                       disabled={addRole.isPending}
                     >
                       <UserPlus className="w-3 h-3 mr-1" />
                       Mod
                     </Button>
                   )}
                 </div>
               </div>
             ))}
 
             {filteredProfiles?.length === 0 && (
               <p className="text-center text-muted-foreground py-8">No users found</p>
             )}
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }
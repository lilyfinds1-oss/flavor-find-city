 import { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { toast } from "sonner";
import { Plus, Pencil, Trash2, Ticket, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealRedemptionAnalytics from "@/components/admin/DealRedemptionAnalytics";
import type { Database } from "@/integrations/supabase/types";
 
 type DealType = Database["public"]["Enums"]["deal_type"];
 
 interface Deal {
   id: string;
   title: string;
   description: string | null;
   deal_type: DealType;
   discount_value: number | null;
   xp_cost: number | null;
   expires_at: string | null;
   is_active: boolean | null;
   restaurant_id: string;
   restaurant?: { name: string } | null;
 }
 
 interface Restaurant {
   id: string;
   name: string;
 }
 
 export default function DealsManager() {
   const [isOpen, setIsOpen] = useState(false);
   const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
   const queryClient = useQueryClient();
 
   const { data: deals, isLoading: dealsLoading } = useQuery({
     queryKey: ["admin-deals"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("deals")
         .select(`
           *,
           restaurant:restaurants!deals_restaurant_id_fkey (name)
         `)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       return data as Deal[];
     },
   });
 
   const { data: restaurants } = useQuery({
     queryKey: ["restaurants-list"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("restaurants")
         .select("id, name")
         .eq("is_active", true)
         .order("name");
 
       if (error) throw error;
       return data as Restaurant[];
     },
   });
 
   const createDeal = useMutation({
     mutationFn: async (deal: Omit<Deal, "id" | "restaurant">) => {
       const { error } = await supabase.from("deals").insert(deal);
       if (error) throw error;
     },
     onSuccess: () => {
       toast.success("Deal created successfully");
       queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
       setIsOpen(false);
     },
     onError: (error: Error) => toast.error(error.message),
   });
 
   const updateDeal = useMutation({
     mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
       const { error } = await supabase.from("deals").update(updates).eq("id", id);
       if (error) throw error;
     },
     onSuccess: () => {
       toast.success("Deal updated successfully");
       queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
       setIsOpen(false);
       setEditingDeal(null);
     },
     onError: (error: Error) => toast.error(error.message),
   });
 
   const deleteDeal = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from("deals").delete().eq("id", id);
       if (error) throw error;
     },
     onSuccess: () => {
       toast.success("Deal deleted");
       queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
     },
     onError: (error: Error) => toast.error(error.message),
   });
 
   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
 
     const dealData = {
       title: formData.get("title") as string,
       description: formData.get("description") as string || null,
       deal_type: formData.get("deal_type") as DealType,
       discount_value: Number(formData.get("discount_value")) || null,
       xp_cost: Number(formData.get("xp_cost")) || 0,
       expires_at: formData.get("expires_at") as string || null,
       is_active: true,
       restaurant_id: formData.get("restaurant_id") as string,
     };
 
     if (editingDeal) {
       updateDeal.mutate({ id: editingDeal.id, ...dealData });
     } else {
       createDeal.mutate(dealData);
     }
   };
 
   const getDealTypeBadge = (type: DealType) => {
     const colors: Record<DealType, string> = {
       percentage: "bg-primary text-primary-foreground",
       fixed: "bg-success text-success-foreground",
       bogo: "bg-amber text-charcoal",
       free_item: "bg-accent text-accent-foreground",
     };
     return colors[type];
   };
 
   if (dealsLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h2 className="font-display text-xl font-semibold flex items-center gap-2">
           <Ticket className="w-5 h-5" />
           Deals Management
         </h2>
         <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingDeal(null); }}>
           <DialogTrigger asChild>
             <Button>
               <Plus className="w-4 h-4 mr-2" />
               New Deal
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>{editingDeal ? "Edit Deal" : "Create New Deal"}</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <Label htmlFor="restaurant_id">Restaurant</Label>
                 <Select name="restaurant_id" defaultValue={editingDeal?.restaurant_id}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select restaurant" />
                   </SelectTrigger>
                   <SelectContent>
                     {restaurants?.map((r) => (
                       <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="title">Title</Label>
                 <Input id="title" name="title" defaultValue={editingDeal?.title} required />
               </div>
               <div>
                 <Label htmlFor="description">Description</Label>
                 <Textarea id="description" name="description" defaultValue={editingDeal?.description || ""} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="deal_type">Type</Label>
                   <Select name="deal_type" defaultValue={editingDeal?.deal_type || "percentage"}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="percentage">Percentage Off</SelectItem>
                       <SelectItem value="fixed">Fixed Amount</SelectItem>
                       <SelectItem value="bogo">Buy One Get One</SelectItem>
                       <SelectItem value="free_item">Free Item</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <Label htmlFor="discount_value">Discount Value</Label>
                   <Input id="discount_value" name="discount_value" type="number" defaultValue={editingDeal?.discount_value || ""} />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="xp_cost">XP Cost</Label>
                   <Input id="xp_cost" name="xp_cost" type="number" defaultValue={editingDeal?.xp_cost || 0} required />
                 </div>
                 <div>
                   <Label htmlFor="expires_at">Expires At</Label>
                   <Input id="expires_at" name="expires_at" type="datetime-local" defaultValue={editingDeal?.expires_at?.slice(0, 16) || ""} />
                 </div>
               </div>
               <Button type="submit" className="w-full" disabled={createDeal.isPending || updateDeal.isPending}>
                 {editingDeal ? "Update Deal" : "Create Deal"}
               </Button>
             </form>
           </DialogContent>
         </Dialog>
       </div>
 
       <div className="grid gap-4">
         {deals?.map((deal) => (
           <Card key={deal.id}>
             <CardContent className="p-4">
               <div className="flex items-start justify-between">
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <h3 className="font-semibold">{deal.title}</h3>
                     <Badge className={getDealTypeBadge(deal.deal_type)}>{deal.deal_type}</Badge>
                     {!deal.is_active && <Badge variant="secondary">Inactive</Badge>}
                   </div>
                   <p className="text-sm text-muted-foreground mb-1">{deal.restaurant?.name}</p>
                   {deal.description && <p className="text-sm">{deal.description}</p>}
                   <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                     <span>XP Cost: {deal.xp_cost}</span>
                     {deal.discount_value && <span>Discount: {deal.discount_value}</span>}
                     {deal.expires_at && (
                       <span>Expires: {new Date(deal.expires_at).toLocaleDateString()}</span>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="icon"
                     onClick={() => { setEditingDeal(deal); setIsOpen(true); }}
                   >
                     <Pencil className="w-4 h-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="icon"
                     onClick={() => deleteDeal.mutate(deal.id)}
                     disabled={deleteDeal.isPending}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
         {deals?.length === 0 && (
           <p className="text-center text-muted-foreground py-8">No deals yet. Create your first deal!</p>
         )}
       </div>
     </div>
   );
 }
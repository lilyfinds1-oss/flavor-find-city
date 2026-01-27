import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminRestaurants, useUpdateRestaurant, useDeleteRestaurant } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Star, MapPin } from "lucide-react";
import RestaurantForm from "./RestaurantForm";
import { Link } from "react-router-dom";

export default function RestaurantManager() {
  const [search, setSearch] = useState("");
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: restaurants, isLoading } = useAdminRestaurants();
  const updateRestaurant = useUpdateRestaurant();
  const deleteRestaurant = useDeleteRestaurant();
  const { toast } = useToast();

  const filteredRestaurants = restaurants?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.neighborhood?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateRestaurant.mutateAsync({
        id,
        updates: { is_active: !currentStatus },
      });
      toast({
        title: currentStatus ? "Restaurant deactivated" : "Restaurant activated",
        description: "Changes saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRestaurant.mutateAsync(id);
      toast({
        title: "Restaurant deleted",
        description: "The restaurant has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Restaurant Management</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
            </DialogHeader>
            <RestaurantForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants?.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {restaurant.cover_image && (
                        <img
                          src={restaurant.cover_image}
                          alt={restaurant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <Link 
                          to={`/restaurant/${restaurant.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {restaurant.name}
                        </Link>
                        <div className="flex gap-1 mt-1">
                          {restaurant.cuisines?.slice(0, 2).map((cuisine) => (
                            <Badge key={cuisine} variant="secondary" className="text-xs">
                              {cuisine}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">{restaurant.neighborhood || restaurant.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{restaurant.average_rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                      {restaurant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(restaurant.id, restaurant.is_active ?? true)}
                      >
                        {restaurant.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Dialog 
                        open={editingRestaurant === restaurant.id} 
                        onOpenChange={(open) => setEditingRestaurant(open ? restaurant.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Restaurant</DialogTitle>
                          </DialogHeader>
                          <RestaurantForm 
                            restaurant={restaurant} 
                            onSuccess={() => setEditingRestaurant(null)} 
                          />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{restaurant.name}" and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(restaurant.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRestaurants?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No restaurants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

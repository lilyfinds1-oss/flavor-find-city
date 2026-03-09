import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRestaurant, useUpdateRestaurant } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { Constants } from "@/integrations/supabase/types";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type CuisineType = Database["public"]["Enums"]["cuisine_type"];
type PriceRange = Database["public"]["Enums"]["price_range"];

const cuisineOptions = Constants.public.Enums.cuisine_type;
const priceRangeOptions = Constants.public.Enums.price_range;

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().default("Lahore"),
  neighborhood: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  cover_image: z.string().url().optional().or(z.literal("")),
  price_range: z.enum(["$", "$$", "$$$", "$$$$"]).default("$$"),
  cuisines: z.array(z.string()).default([]),
  is_halal: z.boolean().default(false),
  is_family_friendly: z.boolean().default(false),
  has_delivery: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onSuccess?: () => void;
}

export default function RestaurantForm({ restaurant, onSuccess }: RestaurantFormProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    (restaurant?.cuisines as string[]) || []
  );
  
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: restaurant?.name || "",
      slug: restaurant?.slug || "",
      description: restaurant?.description || "",
      address: restaurant?.address || "",
      city: restaurant?.city || "Toronto",
      neighborhood: restaurant?.neighborhood || "",
      phone: restaurant?.phone || "",
      website: restaurant?.website || "",
      cover_image: restaurant?.cover_image || "",
      price_range: (restaurant?.price_range as PriceRange) || "$$",
      cuisines: (restaurant?.cuisines as string[]) || [],
      is_halal: restaurant?.is_halal || false,
      is_family_friendly: restaurant?.is_family_friendly || false,
      has_delivery: restaurant?.has_delivery || false,
      is_active: restaurant?.is_active ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (restaurant) {
        await updateRestaurant.mutateAsync({
          id: restaurant.id,
          updates: {
            name: data.name,
            slug: data.slug,
            address: data.address,
            city: data.city,
            cuisines: selectedCuisines as CuisineType[],
            price_range: data.price_range as PriceRange,
            website: data.website || null,
            cover_image: data.cover_image || null,
            description: data.description || null,
            neighborhood: data.neighborhood || null,
            phone: data.phone || null,
            is_halal: data.is_halal,
            is_family_friendly: data.is_family_friendly,
            has_delivery: data.has_delivery,
            is_active: data.is_active,
          },
        });
        toast({ title: "Restaurant updated", description: "Changes saved successfully." });
      } else {
        await createRestaurant.mutateAsync({
          name: data.name,
          slug: data.slug,
          address: data.address,
          city: data.city,
          cuisines: selectedCuisines as CuisineType[],
          price_range: data.price_range as PriceRange,
          website: data.website || null,
          cover_image: data.cover_image || null,
          description: data.description || null,
          neighborhood: data.neighborhood || null,
          phone: data.phone || null,
          is_halal: data.is_halal,
          is_family_friendly: data.is_family_friendly,
          has_delivery: data.has_delivery,
          is_active: data.is_active,
        });
        toast({ title: "Restaurant created", description: "New restaurant added successfully." });
      }
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateSlug = () => {
    const name = form.getValues("name");
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Restaurant Name *</FormLabel>
                <FormControl>
                  <Input {...field} onBlur={generateSlug} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Neighborhood</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Downtown, Kensington" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="price_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Range</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priceRangeOptions.map((price) => (
                    <SelectItem key={price} value={price}>
                      {price} - {
                        price === "$" ? "Budget" :
                        price === "$$" ? "Moderate" :
                        price === "$$$" ? "Upscale" : "Fine Dining"
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Cuisines</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {cuisineOptions.map((cuisine) => (
              <Button
                key={cuisine}
                type="button"
                variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="is_halal"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Halal</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_family_friendly"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Family Friendly</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_delivery"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Has Delivery</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Active (Visible to users)</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createRestaurant.isPending || updateRestaurant.isPending}>
            {createRestaurant.isPending || updateRestaurant.isPending
              ? "Saving..."
              : restaurant
              ? "Update Restaurant"
              : "Create Restaurant"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

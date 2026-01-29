import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MapFilterState {
  cuisines: string[];
  priceRange: string[];
  isHalal: boolean;
  isFamilyFriendly: boolean;
  hasDelivery: boolean;
}

interface MapFiltersProps {
  filters: MapFilterState;
  onFiltersChange: (filters: MapFilterState) => void;
}

const CUISINE_OPTIONS = [
  "desi",
  "chinese",
  "italian",
  "fast_food",
  "bbq",
  "cafe",
  "bakery",
];

const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$"];

export function MapFilters({ filters, onFiltersChange }: MapFiltersProps) {
  const activeFilterCount =
    filters.cuisines.length +
    filters.priceRange.length +
    (filters.isHalal ? 1 : 0) +
    (filters.isFamilyFriendly ? 1 : 0) +
    (filters.hasDelivery ? 1 : 0);

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter((c) => c !== cuisine)
      : [...filters.cuisines, cuisine];
    onFiltersChange({ ...filters, cuisines: newCuisines });
  };

  const togglePrice = (price: string) => {
    const newPrices = filters.priceRange.includes(price)
      ? filters.priceRange.filter((p) => p !== price)
      : [...filters.priceRange, price];
    onFiltersChange({ ...filters, priceRange: newPrices });
  };

  const clearFilters = () => {
    onFiltersChange({
      cuisines: [],
      priceRange: [],
      isHalal: false,
      isFamilyFriendly: false,
      hasDelivery: false,
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="glass" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Cuisine</DropdownMenuLabel>
          {CUISINE_OPTIONS.map((cuisine) => (
            <DropdownMenuCheckboxItem
              key={cuisine}
              checked={filters.cuisines.includes(cuisine)}
              onCheckedChange={() => toggleCuisine(cuisine)}
            >
              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace("_", " ")}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Price Range</DropdownMenuLabel>
          {PRICE_OPTIONS.map((price) => (
            <DropdownMenuCheckboxItem
              key={price}
              checked={filters.priceRange.includes(price)}
              onCheckedChange={() => togglePrice(price)}
            >
              {price}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Features</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.isHalal}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, isHalal: checked })
            }
          >
            Halal
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.isFamilyFriendly}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, isFamilyFriendly: checked })
            }
          >
            Family Friendly
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.hasDelivery}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, hasDelivery: checked })
            }
          >
            Delivery Available
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick filter buttons */}
      <Button
        variant={filters.isHalal ? "default" : "glass"}
        size="sm"
        onClick={() => onFiltersChange({ ...filters, isHalal: !filters.isHalal })}
      >
        Halal
      </Button>

      <Button
        variant={filters.priceRange.includes("$$") ? "default" : "glass"}
        size="sm"
        onClick={() => togglePrice("$$")}
      >
        $$
      </Button>

      <Button
        variant={filters.hasDelivery ? "default" : "glass"}
        size="sm"
        onClick={() => onFiltersChange({ ...filters, hasDelivery: !filters.hasDelivery })}
      >
        Delivery
      </Button>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-3 h-3" />
          Clear
        </Button>
      )}
    </div>
  );
}

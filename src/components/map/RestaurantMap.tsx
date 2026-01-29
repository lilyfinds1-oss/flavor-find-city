import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Restaurant } from "@/hooks/useRestaurants";
import { MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RestaurantMapProps {
  restaurants: Restaurant[];
  mapboxToken: string;
  onMarkerClick?: (restaurant: Restaurant) => void;
  selectedRestaurantId?: string;
}

// Lahore, Pakistan coordinates
const LAHORE_CENTER: [number, number] = [74.3587, 31.5204];
const DEFAULT_ZOOM = 12;

export function RestaurantMap({
  restaurants,
  mapboxToken,
  onMarkerClick,
  selectedRestaurantId,
}: RestaurantMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: LAHORE_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "bottom-right"
      );
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }));

      map.current.on("load", () => {
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError("Failed to load map. Please check your Mapbox token.");
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError("Failed to initialize map. Please check your Mapbox token.");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Add restaurant markers with clustering
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter restaurants with valid coordinates
    const validRestaurants = restaurants.filter(
      (r) => r.latitude && r.longitude
    );

    if (validRestaurants.length === 0) return;

    // Add cluster source if not exists
    const sourceId = "restaurants-source";
    const clusterId = "clusters";
    const clusterCountId = "cluster-count";
    const unclusteredPointId = "unclustered-point";

    // Remove existing layers and source
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(clusterCountId);
      map.current.removeLayer(clusterId);
      map.current.removeLayer(unclusteredPointId);
      map.current.removeSource(sourceId);
    }

    // Create GeoJSON data
    const geojsonData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: validRestaurants.map((restaurant) => ({
        type: "Feature",
        properties: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          rating: restaurant.google_rating,
          cuisines: restaurant.cuisines.join(", "),
          priceRange: restaurant.price_range,
          neighborhood: restaurant.neighborhood,
          coverImage: restaurant.cover_image,
          trendScore: restaurant.tiktok_trend_score,
        },
        geometry: {
          type: "Point",
          coordinates: [restaurant.longitude!, restaurant.latitude!],
        },
      })),
    };

    // Add source with clustering
    map.current.addSource(sourceId, {
      type: "geojson",
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Cluster circles
    map.current.addLayer({
      id: clusterId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "hsl(24, 100%, 50%)", // primary color
          10,
          "hsl(24, 90%, 45%)",
          30,
          "hsl(24, 80%, 40%)",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
        "circle-stroke-width": 2,
        "circle-stroke-color": "hsl(45, 100%, 60%)", // amber
      },
    });

    // Cluster count labels
    map.current.addLayer({
      id: clusterCountId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 14,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    // Individual restaurant points
    map.current.addLayer({
      id: unclusteredPointId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "case",
          [">=", ["get", "trendScore"], 50],
          "hsl(45, 100%, 50%)", // trending (amber)
          "hsl(24, 100%, 50%)", // primary
        ],
        "circle-radius": 10,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Click on cluster to zoom
    map.current.on("click", clusterId, (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: [clusterId],
      });
      const clusterId2 = features[0]?.properties?.cluster_id;
      const source = map.current!.getSource(sourceId) as mapboxgl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId2, (err, zoom) => {
        if (err) return;
        const geometry = features[0].geometry;
        if (geometry.type === "Point") {
          map.current!.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoom!,
          });
        }
      });
    });

    // Click on individual point
    map.current.on("click", unclusteredPointId, (e) => {
      const features = e.features;
      if (!features || features.length === 0) return;

      const props = features[0].properties;
      const geometry = features[0].geometry;
      
      if (geometry.type !== "Point") return;
      
      const coordinates = geometry.coordinates.slice() as [number, number];

      // Show popup
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          ${props?.coverImage ? `<img src="${props.coverImage}" alt="${props?.name}" class="w-full h-24 object-cover rounded mb-2" />` : ""}
          <h3 class="font-semibold text-sm">${props?.name}</h3>
          <p class="text-xs text-gray-500">${props?.cuisines || "Various"} • ${props?.priceRange || "$$"}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-amber-500">★</span>
            <span class="text-xs font-medium">${Number(props?.rating || 0).toFixed(1)}</span>
            ${props?.trendScore >= 50 ? '<span class="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">🔥 Trending</span>' : ""}
          </div>
          <p class="text-xs text-gray-400 mt-1">${props?.neighborhood || "Lahore"}</p>
          <a href="/restaurant/${props?.slug}" class="text-xs text-orange-500 hover:underline mt-2 block">View Details →</a>
        </div>
      `;

      new mapboxgl.Popup({ offset: 15, closeButton: false })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map.current!);

      // Callback
      if (onMarkerClick) {
        const restaurant = restaurants.find((r) => r.id === props?.id);
        if (restaurant) onMarkerClick(restaurant);
      }
    });

    // Cursor styling
    map.current.on("mouseenter", clusterId, () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", clusterId, () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
    map.current.on("mouseenter", unclusteredPointId, () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", unclusteredPointId, () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
  }, [restaurants, mapLoaded, onMarkerClick]);

  // Fly to selected restaurant
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedRestaurantId) return;

    const restaurant = restaurants.find((r) => r.id === selectedRestaurantId);
    if (restaurant?.latitude && restaurant?.longitude) {
      map.current.flyTo({
        center: [restaurant.longitude, restaurant.latitude],
        zoom: 16,
        essential: true,
      });
    }
  }, [selectedRestaurantId, restaurants, mapLoaded]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
          <h2 className="font-display text-2xl font-bold mb-2">Map Not Configured</h2>
          <p className="text-muted-foreground">
            Please configure your Mapbox token in Admin Settings to enable the interactive map.
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mapError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}

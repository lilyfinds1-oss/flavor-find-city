import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface City {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  default_zoom: number;
  neighborhoods: string[];
  is_active: boolean;
}

interface CityContextType {
  city: City | null;
  cities: City[];
  isLoading: boolean;
  setCity: (city: City) => void;
  hasCitySelected: boolean;
}

const CityContext = createContext<CityContextType>({
  city: null,
  cities: [],
  isLoading: true,
  setCity: () => {},
  hasCitySelected: false,
});

export function useCity() {
  return useContext(CityContext);
}

const CITY_STORAGE_KEY = "citybites_selected_city";

export function CityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch all cities
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as City[];
    },
  });

  // Initialize from localStorage or profile
  useEffect(() => {
    if (citiesLoading || cities.length === 0) return;

    const loadCity = async () => {
      // Try localStorage first
      const storedSlug = localStorage.getItem(CITY_STORAGE_KEY);
      if (storedSlug) {
        const found = cities.find((c) => c.slug === storedSlug);
        if (found) {
          setSelectedCity(found);
          setInitialized(true);
          return;
        }
      }

      // Try profile if logged in
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("location")
          .eq("id", user.id)
          .single();
        if (data?.location) {
          const found = cities.find((c) => c.slug === data.location || c.name === data.location);
          if (found) {
            setSelectedCity(found);
            localStorage.setItem(CITY_STORAGE_KEY, found.slug);
            setInitialized(true);
            return;
          }
        }
      }

      // No city selected yet
      setInitialized(true);
    };

    loadCity();
  }, [cities, citiesLoading, user]);

  const handleSetCity = async (city: City) => {
    setSelectedCity(city);
    localStorage.setItem(CITY_STORAGE_KEY, city.slug);

    // Save to profile if logged in
    if (user) {
      supabase
        .from("profiles")
        .update({ location: city.slug, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .then(() => {});
    }
  };

  return (
    <CityContext.Provider
      value={{
        city: selectedCity,
        cities,
        isLoading: citiesLoading || !initialized,
        setCity: handleSetCity,
        hasCitySelected: !!selectedCity,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

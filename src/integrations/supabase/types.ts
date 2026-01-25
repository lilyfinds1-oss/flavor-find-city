export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      deal_redemptions: {
        Row: {
          deal_id: string
          id: string
          redeemed_at: string | null
          used_at: string | null
          user_id: string
          xp_spent: number | null
        }
        Insert: {
          deal_id: string
          id?: string
          redeemed_at?: string | null
          used_at?: string | null
          user_id: string
          xp_spent?: number | null
        }
        Update: {
          deal_id?: string
          id?: string
          redeemed_at?: string | null
          used_at?: string | null
          user_id?: string
          xp_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_redemptions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          code: string | null
          created_at: string | null
          current_redemptions: number | null
          deal_type: Database["public"]["Enums"]["deal_type"]
          description: string | null
          discount_value: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          restaurant_id: string
          starts_at: string | null
          terms: string | null
          title: string
          xp_cost: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          current_redemptions?: number | null
          deal_type: Database["public"]["Enums"]["deal_type"]
          description?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          restaurant_id: string
          starts_at?: string | null
          terms?: string | null
          title: string
          xp_cost?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          current_redemptions?: number | null
          deal_type?: Database["public"]["Enums"]["deal_type"]
          description?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          restaurant_id?: string
          starts_at?: string | null
          terms?: string | null
          title?: string
          xp_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_subscribed: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_verified_foodie: boolean | null
          location: string | null
          total_photos: number | null
          total_reviews: number | null
          total_votes: number | null
          updated_at: string | null
          username: string | null
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_verified_foodie?: boolean | null
          location?: string | null
          total_photos?: number | null
          total_reviews?: number | null
          total_votes?: number | null
          updated_at?: string | null
          username?: string | null
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_verified_foodie?: boolean | null
          location?: string | null
          total_photos?: number | null
          total_reviews?: number | null
          total_votes?: number | null
          updated_at?: string | null
          username?: string | null
          xp_points?: number | null
        }
        Relationships: []
      }
      restaurant_categories: {
        Row: {
          category_id: string
          restaurant_id: string
        }
        Insert: {
          category_id: string
          restaurant_id: string
        }
        Update: {
          category_id?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_votes: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_votes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          average_rating: number | null
          city: string
          city_rank: number | null
          cover_image: string | null
          created_at: string | null
          cuisines: Database["public"]["Enums"]["cuisine_type"][] | null
          description: string | null
          facebook_popularity: number | null
          google_rating: number | null
          google_review_count: number | null
          has_delivery: boolean | null
          has_outdoor_seating: boolean | null
          has_reservations: boolean | null
          has_takeout: boolean | null
          hours: Json | null
          id: string
          instagram: string | null
          internal_votes: number | null
          is_active: boolean | null
          is_family_friendly: boolean | null
          is_halal: boolean | null
          is_promoted: boolean | null
          is_vegan_friendly: boolean | null
          is_vegetarian_friendly: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          phone: string | null
          photos: string[] | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          ranking_score: number | null
          signature_dishes: string[] | null
          slug: string
          tiktok: string | null
          tiktok_trend_score: number | null
          total_reviews: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          average_rating?: number | null
          city?: string
          city_rank?: number | null
          cover_image?: string | null
          created_at?: string | null
          cuisines?: Database["public"]["Enums"]["cuisine_type"][] | null
          description?: string | null
          facebook_popularity?: number | null
          google_rating?: number | null
          google_review_count?: number | null
          has_delivery?: boolean | null
          has_outdoor_seating?: boolean | null
          has_reservations?: boolean | null
          has_takeout?: boolean | null
          hours?: Json | null
          id?: string
          instagram?: string | null
          internal_votes?: number | null
          is_active?: boolean | null
          is_family_friendly?: boolean | null
          is_halal?: boolean | null
          is_promoted?: boolean | null
          is_vegan_friendly?: boolean | null
          is_vegetarian_friendly?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          photos?: string[] | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          ranking_score?: number | null
          signature_dishes?: string[] | null
          slug: string
          tiktok?: string | null
          tiktok_trend_score?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          average_rating?: number | null
          city?: string
          city_rank?: number | null
          cover_image?: string | null
          created_at?: string | null
          cuisines?: Database["public"]["Enums"]["cuisine_type"][] | null
          description?: string | null
          facebook_popularity?: number | null
          google_rating?: number | null
          google_review_count?: number | null
          has_delivery?: boolean | null
          has_outdoor_seating?: boolean | null
          has_reservations?: boolean | null
          has_takeout?: boolean | null
          hours?: Json | null
          id?: string
          instagram?: string | null
          internal_votes?: number | null
          is_active?: boolean | null
          is_family_friendly?: boolean | null
          is_halal?: boolean | null
          is_promoted?: boolean | null
          is_vegan_friendly?: boolean | null
          is_vegetarian_friendly?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          photos?: string[] | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          ranking_score?: number | null
          signature_dishes?: string[] | null
          slug?: string
          tiktok?: string | null
          tiktok_trend_score?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string | null
          helpful_votes: number | null
          id: string
          is_verified_visit: boolean | null
          photos: string[] | null
          rating: number
          restaurant_id: string
          status: Database["public"]["Enums"]["review_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string
          video_url: string | null
          xp_earned: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_visit?: boolean | null
          photos?: string[] | null
          rating: number
          restaurant_id: string
          status?: Database["public"]["Enums"]["review_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          xp_earned?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_verified_visit?: boolean | null
          photos?: string[] | null
          rating?: number
          restaurant_id?: string
          status?: Database["public"]["Enums"]["review_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_restaurants: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          action: string
          amount: number
          created_at: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ranking_score: {
        Args: { restaurant_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      cuisine_type:
        | "american"
        | "italian"
        | "mexican"
        | "chinese"
        | "japanese"
        | "indian"
        | "thai"
        | "mediterranean"
        | "french"
        | "korean"
        | "vietnamese"
        | "middle_eastern"
        | "bbq"
        | "seafood"
        | "steakhouse"
        | "pizza"
        | "burger"
        | "cafe"
        | "bakery"
        | "desi"
        | "halal"
        | "vegetarian"
        | "vegan"
        | "fast_food"
        | "fine_dining"
        | "other"
      deal_type: "percentage" | "fixed" | "bogo" | "free_item"
      price_range: "$" | "$$" | "$$$" | "$$$$"
      review_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      cuisine_type: [
        "american",
        "italian",
        "mexican",
        "chinese",
        "japanese",
        "indian",
        "thai",
        "mediterranean",
        "french",
        "korean",
        "vietnamese",
        "middle_eastern",
        "bbq",
        "seafood",
        "steakhouse",
        "pizza",
        "burger",
        "cafe",
        "bakery",
        "desi",
        "halal",
        "vegetarian",
        "vegan",
        "fast_food",
        "fine_dining",
        "other",
      ],
      deal_type: ["percentage", "fixed", "bogo", "free_item"],
      price_range: ["$", "$$", "$$$", "$$$$"],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const

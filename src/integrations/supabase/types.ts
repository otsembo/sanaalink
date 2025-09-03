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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      availability_settings: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          is_available: boolean | null
          provider_id: string | null
          start_time: string
          updated_at: string | null
          weekday: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          is_available?: boolean | null
          provider_id?: string | null
          start_time: string
          updated_at?: string | null
          weekday: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          provider_id?: string | null
          start_time?: string
          updated_at?: string | null
          weekday?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          payment_status: string
          provider_id: string | null
          service_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_status: string
          provider_id?: string | null
          service_id?: string | null
          status: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          provider_id?: string | null
          service_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_configs: {
        Row: {
          created_at: string | null
          domain_name: string
          expires_at: string | null
          id: string
          is_verified: boolean | null
          provider_id: string | null
          updated_at: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string | null
          domain_name: string
          expires_at?: string | null
          id?: string
          is_verified?: boolean | null
          provider_id?: string | null
          updated_at?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string | null
          domain_name?: string
          expires_at?: string | null
          id?: string
          is_verified?: boolean | null
          provider_id?: string | null
          updated_at?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_configs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          payment_status: string
          product_id: string | null
          provider_id: string | null
          quantity: number
          shipping_address: string
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_status: string
          product_id?: string | null
          provider_id?: string | null
          quantity: number
          shipping_address: string
          status: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          product_id?: string | null
          provider_id?: string | null
          quantity?: number
          shipping_address?: string
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          payment_method: string
          provider_id: string
          status: string
          transaction_id: string | null
          transaction_ref: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          payment_method?: string
          provider_id: string
          status?: string
          transaction_id?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          payment_method?: string
          provider_id?: string
          status?: string
          transaction_id?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          images: string[] | null
          is_available: boolean | null
          price: number
          provider_id: string | null
          stock_quantity: number
          sub_category: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          price: number
          provider_id?: string | null
          stock_quantity?: number
          sub_category?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          price?: number
          provider_id?: string | null
          stock_quantity?: number
          sub_category?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          bio: string
          business_name: string
          category: string
          created_at: string | null
          domain_name: string | null
          domain_verification_token: string | null
          email: string
          id: string
          is_verified: boolean | null
          location: string
          name: string
          phone: string
          portfolio_images: string[] | null
          preferred_contact: string
          profile_image: string | null
          sub_category: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          bio: string
          business_name: string
          category: string
          created_at?: string | null
          domain_name?: string | null
          domain_verification_token?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          location: string
          name: string
          phone: string
          portfolio_images?: string[] | null
          preferred_contact: string
          profile_image?: string | null
          sub_category?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: string
          business_name?: string
          category?: string
          created_at?: string | null
          domain_name?: string | null
          domain_verification_token?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          location?: string
          name?: string
          phone?: string
          portfolio_images?: string[] | null
          preferred_contact?: string
          profile_image?: string | null
          sub_category?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string | null
          customer_id: string | null
          id: string
          images: string[] | null
          product_id: string | null
          provider_id: string | null
          rating: number
          response: string | null
          response_at: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          images?: string[] | null
          product_id?: string | null
          provider_id?: string | null
          rating: number
          response?: string | null
          response_at?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          images?: string[] | null
          product_id?: string | null
          provider_id?: string | null
          rating?: number
          response?: string | null
          response_at?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          availability: Json | null
          category: string
          created_at: string | null
          description: string
          duration: number | null
          id: string
          images: string[] | null
          is_available: boolean | null
          price: number
          provider_id: string | null
          sub_category: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          availability?: Json | null
          category: string
          created_at?: string | null
          description: string
          duration?: number | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          price: number
          provider_id?: string | null
          sub_category?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          availability?: Json | null
          category?: string
          created_at?: string | null
          description?: string
          duration?: number | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          price?: number
          provider_id?: string | null
          sub_category?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_modify_provider: {
        Args: { target_provider_id: string }
        Returns: boolean
      }
      get_provider_by_user_id: {
        Args: { lookup_user_id: string }
        Returns: {
          bio: string
          business_name: string
          category: string
          created_at: string | null
          domain_name: string | null
          domain_verification_token: string | null
          email: string
          id: string
          is_verified: boolean | null
          location: string
          name: string
          phone: string
          portfolio_images: string[] | null
          preferred_contact: string
          profile_image: string | null
          sub_category: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }[]
      }
      get_user_bookings: {
        Args: { lookup_user_id: string }
        Returns: {
          booking_date: string
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          payment_status: string
          provider_id: string | null
          service_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }[]
      }
      insert_provider: {
        Args: { provider_data: Json }
        Returns: {
          bio: string
          business_name: string
          category: string
          created_at: string | null
          domain_name: string | null
          domain_verification_token: string | null
          email: string
          id: string
          is_verified: boolean | null
          location: string
          name: string
          phone: string
          portfolio_images: string[] | null
          preferred_contact: string
          profile_image: string | null
          sub_category: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
      }
      is_provider: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

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
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          block_id: string | null
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          profile_id: string | null
          referrer: string | null
          visitor_id: string | null
        }
        Insert: {
          block_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          profile_id?: string | null
          referrer?: string | null
          visitor_id?: string | null
        }
        Update: {
          block_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          profile_id?: string | null
          referrer?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "link_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          button_style: Json | null
          content: Json | null
          created_at: string
          desktop_only: boolean | null
          icon: string | null
          id: string
          is_enabled: boolean | null
          is_featured: boolean | null
          mobile_only: boolean | null
          open_in_new_tab: boolean | null
          position: number | null
          profile_id: string
          schedule_end: string | null
          schedule_start: string | null
          subtitle: string | null
          thumbnail_url: string | null
          title: string | null
          total_clicks: number | null
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          button_style?: Json | null
          content?: Json | null
          created_at?: string
          desktop_only?: boolean | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          is_featured?: boolean | null
          mobile_only?: boolean | null
          open_in_new_tab?: boolean | null
          position?: number | null
          profile_id: string
          schedule_end?: string | null
          schedule_start?: string | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string | null
          total_clicks?: number | null
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          button_style?: Json | null
          content?: Json | null
          created_at?: string
          desktop_only?: boolean | null
          icon?: string | null
          id?: string
          is_enabled?: boolean | null
          is_featured?: boolean | null
          mobile_only?: boolean | null
          open_in_new_tab?: boolean | null
          position?: number | null
          profile_id?: string
          schedule_end?: string | null
          schedule_start?: string | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string | null
          total_clicks?: number | null
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "link_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          created_at: string
          dns_verified: boolean | null
          domain: string
          id: string
          is_primary: boolean | null
          profile_id: string
          ssl_status: string | null
          status: string
          updated_at: string
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          dns_verified?: boolean | null
          domain: string
          id?: string
          is_primary?: boolean | null
          profile_id: string
          ssl_status?: string | null
          status?: string
          updated_at?: string
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          dns_verified?: boolean | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          profile_id?: string
          ssl_status?: string | null
          status?: string
          updated_at?: string
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "link_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_profiles: {
        Row: {
          avatar_url: string | null
          background_type: string | null
          background_value: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          custom_colors: Json | null
          custom_fonts: Json | null
          display_name: string | null
          id: string
          is_password_protected: boolean | null
          is_public: boolean | null
          location: string | null
          og_image_url: string | null
          password_hash: string | null
          seo_description: string | null
          seo_title: string | null
          social_links: Json | null
          theme_preset: string | null
          total_views: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          background_type?: string | null
          background_value?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          custom_colors?: Json | null
          custom_fonts?: Json | null
          display_name?: string | null
          id?: string
          is_password_protected?: boolean | null
          is_public?: boolean | null
          location?: string | null
          og_image_url?: string | null
          password_hash?: string | null
          seo_description?: string | null
          seo_title?: string | null
          social_links?: Json | null
          theme_preset?: string | null
          total_views?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          background_type?: string | null
          background_value?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          custom_colors?: Json | null
          custom_fonts?: Json | null
          display_name?: string | null
          id?: string
          is_password_protected?: boolean | null
          is_public?: boolean | null
          location?: string | null
          og_image_url?: string | null
          password_hash?: string | null
          seo_description?: string | null
          seo_title?: string | null
          social_links?: Json | null
          theme_preset?: string | null
          total_views?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "client"
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
      app_role: ["super_admin", "admin", "client"],
    },
  },
} as const

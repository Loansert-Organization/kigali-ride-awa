export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_trip_flags: {
        Row: {
          admin_user_id: string
          created_at: string
          flag_reason: string
          flag_type: string | null
          id: string
          resolved: boolean | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          flag_reason: string
          flag_type?: string | null
          id?: string
          resolved?: boolean | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          flag_reason?: string
          flag_type?: string | null
          id?: string
          resolved?: boolean | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_trip_flags_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "admin_trip_flags_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_trip_flags_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_trip_flags_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_logs: {
        Row: {
          component: string | null
          created_at: string | null
          event_type: string
          id: string
          message: string
          metadata: Json | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "agent_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          confirmed: boolean | null
          created_at: string
          driver_trip_id: string
          id: string
          passenger_trip_id: string
          updated_at: string
          whatsapp_launched: boolean | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          driver_trip_id: string
          id?: string
          passenger_trip_id: string
          updated_at?: string
          whatsapp_launched?: boolean | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          driver_trip_id?: string
          id?: string
          passenger_trip_id?: string
          updated_at?: string
          whatsapp_launched?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_trip_id_fkey"
            columns: ["driver_trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_passenger_trip_id_fkey"
            columns: ["passenger_trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_presence: {
        Row: {
          driver_id: string
          is_online: boolean | null
          last_seen: string | null
          lat: number | null
          lng: number | null
          updated_at: string | null
        }
        Insert: {
          driver_id: string
          is_online?: boolean | null
          last_seen?: string | null
          lat?: number | null
          lng?: number | null
          updated_at?: string | null
        }
        Update: {
          driver_id?: string
          is_online?: boolean | null
          last_seen?: string | null
          lat?: number | null
          lng?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_presence_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_presence_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_presence_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          created_at: string
          is_online: boolean | null
          plate_number: string
          preferred_zone: string | null
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          is_online?: boolean | null
          plate_number: string
          preferred_zone?: string | null
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          is_online?: boolean | null
          plate_number?: string
          preferred_zone?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          address: string
          created_at: string
          id: string
          label: string
          lat: number | null
          lng: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          label: string
          lat?: number | null
          lng?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          label?: string
          lat?: number | null
          lng?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          upload_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          upload_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          upload_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          id: string
          message: string | null
          trip_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          trip_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          trip_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_tasks: {
        Row: {
          attempts: number | null
          created_at: string | null
          event: string
          id: number
          payload: Json
          processed_at: string | null
          scheduled_at: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          event: string
          id?: number
          payload?: Json
          processed_at?: string | null
          scheduled_at?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          event?: string
          id?: number
          payload?: Json
          processed_at?: string | null
          scheduled_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trip_heatmap_logs: {
        Row: {
          created_at: string
          id: string
          lat: number
          lng: number
          role: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lat: number
          lng: number
          role: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          role?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_heatmap_logs_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          description: string | null
          fare: number | null
          from_lat: number | null
          from_lng: number | null
          from_location: string
          id: string
          is_negotiable: boolean | null
          role: string
          scheduled_time: string
          seats_available: number | null
          status: string | null
          to_lat: number | null
          to_lng: number | null
          to_location: string
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fare?: number | null
          from_lat?: number | null
          from_lng?: number | null
          from_location: string
          id?: string
          is_negotiable?: boolean | null
          role: string
          scheduled_time?: string
          seats_available?: number | null
          status?: string | null
          to_lat?: number | null
          to_lng?: number | null
          to_location: string
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fare?: number | null
          from_lat?: number | null
          from_lng?: number | null
          from_location?: string
          id?: string
          is_negotiable?: boolean | null
          role?: string
          scheduled_time?: string
          seats_available?: number | null
          status?: string | null
          to_lat?: number | null
          to_lng?: number | null
          to_location?: string
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          points_awarded: number | null
          referee_id: string
          referee_role: string
          referrer_id: string
          reward_week: string | null
          updated_at: string
          validation_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number | null
          referee_id: string
          referee_role: string
          referrer_id: string
          reward_week?: string | null
          updated_at?: string
          validation_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number | null
          referee_id?: string
          referee_role?: string
          referrer_id?: string
          reward_week?: string | null
          updated_at?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "user_referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string
          id: string
          points: number | null
          reward_issued: boolean | null
          reward_type: string | null
          updated_at: string
          user_id: string
          week: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number | null
          reward_issued?: boolean | null
          reward_type?: string | null
          updated_at?: string
          user_id: string
          week: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number | null
          reward_issued?: boolean | null
          reward_type?: string | null
          updated_at?: string
          user_id?: string
          week?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "driver_booking_success_view"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_rewards_leaderboard_view"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_method: string | null
          auth_user_id: string | null
          created_at: string
          id: string
          language: string | null
          location_enabled: boolean | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          promo_code: string | null
          referred_by: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          auth_method?: string | null
          auth_user_id?: string | null
          created_at?: string
          id?: string
          language?: string | null
          location_enabled?: boolean | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          promo_code?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          auth_method?: string | null
          auth_user_id?: string | null
          created_at?: string
          id?: string
          language?: string | null
          location_enabled?: boolean | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          promo_code?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempts: number | null
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_url: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_url?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_stats_view: {
        Row: {
          online_drivers: number | null
          total_bookings: number | null
          total_drivers: number | null
          total_referrals: number | null
          total_rewards_issued: number | null
          total_trips: number | null
          total_users: number | null
          weekly_bookings: number | null
          weekly_new_users: number | null
          weekly_referrals: number | null
          weekly_trips: number | null
        }
        Relationships: []
      }
      daily_activity_snapshot_view: {
        Row: {
          bookings_created: number | null
          date: string | null
          drivers_joined: number | null
          trips_created: number | null
          users_joined: number | null
        }
        Relationships: []
      }
      driver_booking_success_view: {
        Row: {
          booking_rate_percent: number | null
          bookings_confirmed: number | null
          bookings_received: number | null
          confirmation_rate_percent: number | null
          driver_id: string | null
          promo_code: string | null
          trips_posted: number | null
          vehicle_type: string | null
        }
        Relationships: []
      }
      heatmap_aggregated_view: {
        Row: {
          completion_rate: number | null
          hour_bucket: string | null
          lat_rounded: number | null
          lng_rounded: number | null
          role: string | null
          trip_count: number | null
        }
        Relationships: []
      }
      weekly_rewards_leaderboard_view: {
        Row: {
          id: string | null
          promo_code: string | null
          referrals_made: number | null
          role: string | null
          total_points: number | null
          week_start: string | null
          weekly_rank: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      expire_old_trips: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_promo_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      invoke_queue_worker: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      merge_anonymous_to_verified_user: {
        Args: { anonymous_user_id: string; verified_user_id: string }
        Returns: undefined
      }
      postgres_fdw_disconnect: {
        Args: { "": string }
        Returns: boolean
      }
      postgres_fdw_disconnect_all: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      postgres_fdw_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      postgres_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      process_weekly_rewards: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_view: {
        Args: { view_name: string }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

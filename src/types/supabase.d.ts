// src/types/supabase.d.ts

// Create a placeholder type definition for the Database module
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
      // Add any known tables here to avoid breaking the build
      users: {
        Row: {};
        Insert: {};
        Update: {};
      };
    };
    Views: {};
    Functions: {};
  };
};

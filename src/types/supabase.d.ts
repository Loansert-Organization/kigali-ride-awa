declare module '@supabase/supabase-js' {
  // Extend the default Supabase User object with app-specific metadata fields
  interface User {
    country?: string;
    promo_code?: string;
    language?: string;
    id: string;
    phone?: string;
    role?: string;
    is_anonymous?: boolean;
    [key: string]: any;
  }
} 
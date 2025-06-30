-- supabase/migrations/20240726120000_initial_schema.sql

-- User Roles Enum
create type "public"."user_role" as enum ('passenger', 'driver', 'admin');

-- Trip Status Enum
create type "public"."trip_status" as enum ('requested', 'matched', 'completed', 'cancelled', 'expired', 'open');

-- Trip Match Status Enum
create type "public"."trip_match_status" as enum ('pending', 'confirmed', 'cancelled_by_passenger', 'cancelled_by_driver', 'completed', 'no_show');

-- Payment Status Enum
create type "public"."payment_status" as enum ('pending', 'paid', 'disputed');

-- Vehicle Type Enum
create type "public"."vehicle_type" as enum ('moto', 'car', 'tuktuk', 'minibus');


-- Users Table
create table "public"."users" (
    "id" uuid not null primary key references auth.users on delete cascade,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "phone_number" text,
    "phone_verified" boolean not null default false,
    "full_name" text,
    "avatar_url" text,
    "role" public.user_role,
    "onboarding_completed" boolean not null default false,
    "is_suspended" boolean not null default false,
    "last_seen" timestamp with time zone,
    "anonymous_auth_uid" text
);
alter table "public"."users" enable row level security;

-- Drivers Table
create table "public"."drivers" (
    "user_id" uuid not null primary key references public.users on delete cascade,
    "is_available" boolean not null default false,
    "active_vehicle_id" uuid, -- Will reference driver_vehicles
    "rating" numeric(2, 1) not null default 5.0,
    "total_trips" integer not null default 0,
    "updated_at" timestamp with time zone not null default now()
);
alter table "public"."drivers" enable row level security;

-- Driver Vehicles Table
create table "public"."driver_vehicles" (
    "id" uuid not null primary key default gen_random_uuid(),
    "driver_id" uuid not null references public.users on delete cascade,
    "vehicle_type" public.vehicle_type not null,
    "license_plate" text not null unique,
    "model" text not null,
    "color" text not null,
    "year" integer,
    "is_verified" boolean not null default false
);
alter table "public"."driver_vehicles" enable row level security;

-- Add foreign key from drivers to driver_vehicles
alter table "public"."drivers" add foreign key ("active_vehicle_id") references "public"."driver_vehicles"(id) on delete set null;

-- Passenger Trips Table
create table "public"."passenger_trips" (
    "id" uuid not null primary key default gen_random_uuid(),
    "passenger_id" uuid not null references public.users on delete cascade,
    "from_address" text not null,
    "to_address" text not null,
    "from_lat" float8 not null,
    "from_lng" float8 not null,
    "to_lat" float8 not null,
    "to_lng" float8 not null,
    "requested_departure_time" timestamp with time zone not null,
    "vehicle_type" text not null, -- 'any' or a specific vehicle_type
    "status" public.trip_status not null,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone not null
);
alter table "public"."passenger_trips" enable row level security;

-- Driver Trips Table
create table "public"."driver_trips" (
    "id" uuid not null primary key default gen_random_uuid(),
    "driver_id" uuid not null references public.users on delete cascade,
    "vehicle_id" uuid not null references public.driver_vehicles on delete cascade,
    "from_address" text not null,
    "to_address" text not null,
    "from_lat" float8 not null,
    "from_lng" float8 not null,
    "to_lat" float8 not null,
    "to_lng" float8 not null,
    "scheduled_departure_time" timestamp with time zone not null,
    "available_seats" integer not null,
    "fare_per_seat" integer not null,
    "status" public.trip_status not null,
    "created_at" timestamp with time zone not null default now()
);
alter table "public"."driver_trips" enable row level security;

-- Trip Matches Table
create table "public"."trip_matches" (
    "id" uuid not null primary key default gen_random_uuid(),
    "passenger_trip_id" uuid not null references public.passenger_trips on delete cascade,
    "driver_trip_id" uuid references public.driver_trips on delete cascade,
    "driver_id" uuid not null references public.users on delete cascade,
    "status" public.trip_match_status not null,
    "negotiated_fare" integer,
    "payment_status" public.payment_status not null default 'pending',
    "chat_opened_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);
alter table "public"."trip_matches" enable row level security;

-- Function to automatically set updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Apply the trigger to tables with updated_at
create trigger on_users_update before update on public.users for each row execute procedure public.handle_updated_at();
create trigger on_drivers_update before update on public.drivers for each row execute procedure public.handle_updated_at();
create trigger on_trip_matches_update before update on public.trip_matches for each row execute procedure public.handle_updated_at();

-- RLS POLICIES

-- Users table
alter table "public"."users" enable row level security;
create policy "Users can view their own profile." on "public"."users" for select using (auth.uid() = id);
create policy "Users can update their own profile." on "public"."users" for update using (auth.uid() = id);

-- Drivers table
alter table "public"."drivers" enable row level security;
create policy "Authenticated users can view driver profiles." on "public"."drivers" for select using (auth.role() = 'authenticated');
create policy "Drivers can create their own profile." on "public"."drivers" for insert with check (auth.uid() = user_id);
create policy "Drivers can update their own profile." on "public"."drivers" for update using (auth.uid() = user_id);

-- Driver Vehicles table
alter table "public"."driver_vehicles" enable row level security;
create policy "Drivers can view their own vehicles." on "public"."driver_vehicles" for select using (auth.uid() = driver_id);
create policy "Drivers can create their own vehicles." on "public"."driver_vehicles" for insert with check (auth.uid() = driver_id);
create policy "Drivers can update their own vehicles." on "public"."driver_vehicles" for update using (auth.uid() = driver_id);

-- Passenger Trips table
alter table "public"."passenger_trips" enable row level security;
create policy "Passengers can view their own trip requests." on "public"."passenger_trips" for select using (auth.uid() = passenger_id);
create policy "Passengers can create their own trip requests." on "public"."passenger_trips" for insert with check (auth.uid() = passenger_id);

-- Driver Trips table
alter table "public"."driver_trips" enable row level security;
create policy "Authenticated users can see all open trips." on "public"."driver_trips" for select using (status = 'open' and auth.role() = 'authenticated');
create policy "Drivers can view their own trips." on "public"."driver_trips" for select using (auth.uid() = driver_id);
create policy "Drivers can create their own trips." on "public"."driver_trips" for insert with check (auth.uid() = driver_id);

-- Trip Matches table
alter table "public"."trip_matches" enable row level security;
create policy "Users can view matches for their trips." on "public"."trip_matches" for select using (
  auth.uid() = driver_id or
  auth.uid() = (select passenger_id from passenger_trips where id = trip_matches.passenger_trip_id)
); 
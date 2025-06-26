
/******************************************************************
 *  PassengerHomePage  –  route: /home/passenger
 *  Main dashboard with live Google Map + overlay UI
 ******************************************************************/
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Plus, Star, Gift, UserRound, Home, ShoppingBag,
  Church, History, Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FullScreenMap from "@/components/maps/FullScreenMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";

/* -------- Types ------------------------------------------------- */
type DriverProfile = { id: string; lat: number; lng: number; };
type Trip          = { id: string; from_location: string; to_location: string; lat: number; lng: number; };

/* --------------------------------------------------------------- */
const PassengerHome: React.FC = () => {
  const nav = useNavigate();
  const { userProfile, isGuest } = useAuth();

  const mapRef = useRef<google.maps.Map>();
  const driverMarkersRef = useRef<google.maps.Marker[]>([]);
  const tripMarkersRef   = useRef<google.maps.Marker[]>([]);
  const markerClustererRef = useRef<any>();

  const [favorites, setFavorites]   = useState<any[]>([]);
  const [promoCode, setPromoCode]   = useState<string | null>(null);

  /* ---------- fetch data once user is known -------------------- */
  useEffect(() => {
    fetchFavorites();
    fetchPromoCode();
  }, []);

  async function fetchFavorites() {
    const { data } = await supabase.from("favorites").select("*");
    setFavorites(data ?? []);
  }
  async function fetchPromoCode() {
    const { data } = await supabase.from("users").select("promo_code").single();
    setPromoCode(data?.promo_code ?? null);
  }

  /* ---------- map ready callback ------------------------------- */
  const onMapReady = async (map: google.maps.Map) => {
    mapRef.current = map;
    await loadAndDrawMarkers();
    /* refresh every 15 s */
    setInterval(loadAndDrawMarkers, 15_000);
  };

  /* ---------- load drivers & trips ----------------------------- */
  async function loadAndDrawMarkers() {
    if (!mapRef.current) return;

    /* 1. fetch driver locations */
    const { data: drivers } = await supabase
      .from("driver_profiles")
      .select("id, lat, lng")
      .eq("is_online", true) as { data: DriverProfile[] };

    /* 2. fetch open trips */
    const { data: trips } = await supabase
      .from("trips")
      .select("id, from_location, to_location, lat, lng")
      .eq("role", "driver")
      .gt("scheduled_time", new Date().toISOString()) as { data: Trip[] };

    /* 3. clear old markers */
    driverMarkersRef.current.forEach((m) => m.setMap(null));
    tripMarkersRef.current.forEach((m) => m.setMap(null));

    /* 4. build driver markers with a fun bouncing icon */
    driverMarkersRef.current = (drivers ?? []).map((d) => new google.maps.Marker({
      position: { lat: d.lat, lng: d.lng },
      map: mapRef.current!,
      icon: {
        url: "https://i.imgur.com/xxWzC2w.gif",            // small animated car GIF
        scaledSize: new google.maps.Size(40, 40)
      }
    }));

    /* 5. build trip markers (purple pin) */
    tripMarkersRef.current = (trips ?? []).map((t) => new google.maps.Marker({
      position: { lat: t.lat, lng: t.lng },
      map: mapRef.current!,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#8b5cf6",
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: "#fff"
      }
    }));

    /* 6. cluster driver markers (optional but pretty) */
    const { MarkerClusterer } = await import("@googlemaps/markerclusterer");
    markerClustererRef.current?.clearMarkers?.();
    markerClustererRef.current = new MarkerClusterer({
      map: mapRef.current!,
      markers: driverMarkersRef.current,
    });
  }

  /* ------------------- JSX ------------------------------------- */
  return (
    <Suspense fallback={<Loader />}>
      <FullScreenMap onMapReady={onMapReady}>
        {/* 📍 Smart Suggestions */}
        <div className="absolute top-4 inset-x-4 z-10 space-y-2">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <h3 className="font-semibold mb-2">📍 Where to?</h3>
              <div className="flex gap-2 overflow-x-auto">
                <SuggestBtn icon={<Home size={16}/>} label="Home"/>
                <SuggestBtn icon={<ShoppingBag size={16}/>} label="Market"/>
                <SuggestBtn icon={<Church size={16}/>} label="Church"/>
                <SuggestBtn icon={<History size={16}/>} label="Last Trip"/>
                <SuggestBtn icon={<Plus size={16}/>} label="Add Favorite"/>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ Quick Actions */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <h3 className="font-semibold mb-2">⚡ Quick Actions</h3>
              <div className="flex gap-2 overflow-x-auto">
                <ActionBtn label="Request a Ride"   onClick={()=>nav("/book-ride")} icon={<Plus size={16}/>}/>
                <ActionBtn label="View Driver Trips" onClick={()=>nav("/ride-matches")}   icon={<MapPin size={16}/>}/>
                <ActionBtn label="My Rides"          onClick={()=>nav("/past-trips")}icon={<History size={16}/>}/>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎁 Referral Banner */}
        {promoCode && (
          <div className="absolute top-[190px] inset-x-4 z-10">
            <Card className="bg-amber-100 border-amber-300">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="font-medium">
                  🎁 Share your code <b>{promoCode}</b> &amp; earn free rides!
                </span>
                <Button
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(promoCode)}
                >
                  Copy
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ➕ Floating "Request" button */}
        <div className="absolute bottom-24 right-4 z-10">
          <Button
            className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => nav("/book-ride")}
          >
            <Plus className="w-8 h-8 text-white" />
          </Button>
        </div>

        {/* ▂ Bottom Navigation */}
        <BottomNav nav={nav}/>
      </FullScreenMap>
    </Suspense>
  );
};

/* ------- tiny sub-components ---------------------------------- */
const SuggestBtn: React.FC<{icon:React.ReactNode;label:string}> = ({icon,label})=>(
  <Button variant="outline" size="sm" className="gap-1 shrink-0">
    {icon}<span>{label}</span>
  </Button>
);

const ActionBtn: React.FC<{icon:React.ReactNode;label:string;onClick:()=>void}> = ({icon,label,onClick})=>(
  <Button variant="secondary" size="sm" className="gap-1 shrink-0" onClick={onClick}>
    {icon}<span>{label}</span>
  </Button>
);

const BottomNav: React.FC<{nav:ReturnType<typeof useNavigate>}> = ({nav})=>(
  <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t z-10">
    <div className="max-w-md mx-auto px-4 py-2 flex justify-around">
      <NavBtn icon={<MapPin  size={18}/>} label="Home"/>
      <NavBtn icon={<Plus    size={18}/>} label="Book"      onClick={()=>nav("/book-ride")}/>
      <NavBtn icon={<Star    size={18}/>} label="Favorites" onClick={()=>nav("/favorites")}/>
      <NavBtn icon={<Gift    size={18}/>} label="Rewards"   onClick={()=>nav("/leaderboard")}/>
      <NavBtn icon={<UserRound size={18}/>} label="Profile" onClick={()=>nav("/profile")}/>
    </div>
  </div>
);
const NavBtn: React.FC<{icon:React.ReactNode;label:string;onClick?:()=>void}> = ({icon,label,onClick})=>(
  <Button variant="ghost" size="sm" className="flex-col space-y-1" onClick={onClick}>
    {icon}<span className="text-xs">{label}</span>
  </Button>
);

export default PassengerHome;

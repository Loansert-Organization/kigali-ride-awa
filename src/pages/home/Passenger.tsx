
/**
 * PassengerHomePage – route /home/passenger
 */
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Plus, Star, Gift, UserRound,
  Home, ShoppingBag, Church, History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FullScreenMap from "@/components/maps/FullScreenMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

/* ---------- Types ------------------------------------------- */
type Driver = { user_id: string; lat?: number; lng?: number };
type Trip   = { id: string; from_location: string; to_location: string; from_lat?: number; from_lng?: number };

/* ------------------------------------------------------------ */
const PassengerHomePage: React.FC = () => {
  const nav  = useNavigate();
  const map  = useRef<google.maps.Map>();
  const clusterer = useRef<MarkerClusterer>();

  const [promo, setPromo]         = useState<string | null>(null);
  const driverMarkers             = useRef<google.maps.Marker[]>([]);
  const tripMarkers               = useRef<google.maps.Marker[]>([]);

  /* one-time fetch promo code */
  useEffect(() => {
    supabase.from("users").select("promo_code").single()
      .then(({ data }) => setPromo(data?.promo_code ?? null));
  }, []);

  /* map ready */
  const onMapReady = async (m: google.maps.Map) => {
    map.current = m;
    await refreshMarkers();
    setInterval(refreshMarkers, 15_000);  // every 15 s
  };

  async function refreshMarkers() {
    if (!map.current) return;

    /* DRIVERS - get online drivers with location from driver_presence */
    const { data: drivers } = await supabase
      .from("driver_presence")
      .select("driver_id, lat, lng")
      .eq("is_online", true)
      .not("lat", "is", null)
      .not("lng", "is", null) as { data: Array<{driver_id: string, lat: number, lng: number}> };

    /* TRIPS - get open driver trips */
    const { data: trips } = await supabase
      .from("trips")
      .select("id, from_location, to_location, from_lat, from_lng")
      .eq("role", "driver")
      .eq("status", "pending")
      .gt("scheduled_time", new Date().toISOString())
      .not("from_lat", "is", null)
      .not("from_lng", "is", null) as { data: Trip[] };

    /* clear old */
    driverMarkers.current.forEach(m => m.setMap(null));
    tripMarkers.current.forEach(m => m.setMap(null));

    /* driver markers */
    driverMarkers.current = (drivers ?? []).map(d => new google.maps.Marker({
      position: { lat: d.lat, lng: d.lng },
      map: map.current!,
      icon: {
        url: "https://i.imgur.com/xxWzC2w.gif",   // tiny animated car
        scaledSize: new google.maps.Size(40, 40)
      }
    }));

    /* trip pins */
    tripMarkers.current = (trips ?? []).map(t => new google.maps.Marker({
      position: { lat: t.from_lat!, lng: t.from_lng! },
      map: map.current!,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#8b5cf6",
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: "#fff"
      }
    }));

    /* cluster drivers */
    clusterer.current?.clearMarkers();
    clusterer.current = new MarkerClusterer({ map: map.current!, markers: driverMarkers.current });
  }

  /* ---------------------------------------------------------- */
  return (
    <Suspense fallback={<Loader/>}>
      <FullScreenMap onMapReady={onMapReady}>
        {/* 📍 Smart Suggestions */}
        <div className="absolute top-4 inset-x-4 z-10 space-y-2">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <h3 className="font-semibold mb-2">📍 Where to?</h3>
              <div className="flex gap-2 overflow-x-auto">
                {["Home","Market","Church","Last Trip","Add Favorite"].map(txt=>(
                  <Button key={txt} variant="outline" size="sm" className="shrink-0">{txt}</Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 🎁 Referral */}
          {promo && (
            <Card className="bg-amber-100 border-amber-300">
              <CardContent className="p-3 flex justify-between items-center">
                <span>🎁 Share code <b>{promo}</b> &amp; earn rides!</span>
                <Button size="sm" onClick={()=>navigator.clipboard.writeText(promo)}>Copy</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ➕ floating button */}
        <div className="absolute bottom-24 right-4 z-10">
          <Button className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                  onClick={()=>nav("/book-ride")}>
            <Plus className="w-8 h-8 text-white"/>
          </Button>
        </div>

        {/* ▂ Bottom nav */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t z-10">
          <div className="max-w-md mx-auto px-4 py-2 flex justify-around">
            {[
              {icon:<MapPin size={18}/>, label:"Home",   to:"/home/passenger"},
              {icon:<Plus   size={18}/>, label:"Book",   to:"/book-ride"},
              {icon:<Star   size={18}/>, label:"Favs",   to:"/favorites"},
              {icon:<Gift   size={18}/>, label:"Rewards",to:"/leaderboard"},
              {icon:<UserRound size={18}/>,label:"Profile",to:"/profile"},
            ].map(tab=>(
              <Button key={tab.label} variant="ghost" size="sm"
                      className="flex-col space-y-1"
                      onClick={()=>nav(tab.to)}>
                {tab.icon}<span className="text-xs">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </FullScreenMap>
    </Suspense>
  );
};

export default PassengerHomePage;

import React, { useEffect } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.length > 10;

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ id: string; lat: number; lng: number; color?: string; label?: string }>;
  children?: React.ReactNode;
  followDriver?: boolean;
}

function MapController({ markers, center, followDriver }: { markers: any[], center: any, followDriver?: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map || markers.length === 0) return;

    // Fit bounds only if more than one marker and not in "follow driver" mode
    if (markers.length > 1 && !followDriver && typeof google !== 'undefined' && google.maps) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
      map.fitBounds(bounds, { top: 100, bottom: 300, left: 100, right: 100 });
    } else if (followDriver && center) {
      // Smoothly pan to center if following
      map.panTo(center);
    }
  }, [map, markers, center, followDriver]);

  return null;
}

export default function Map({ center = { lat: -23.5505, lng: -46.6333 }, zoom = 14, markers = [], children, followDriver = false }: MapProps) {
  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-3xl h-full text-center">
        <h2 className="text-xl font-bold mb-4">Google Maps API Key Required</h2>
        <p className="text-zinc-400 mb-6 text-sm max-w-md"> Por favor, adicione sua chave nas configurações (Settings) do AI Studio com o nome `VITE_GOOGLE_MAPS_API_KEY`.</p>
        <a 
          href="https://console.cloud.google.com/google/maps-apis/start" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2 bg-yellow-500 text-black rounded-full font-bold hover:bg-yellow-400 transition-colors"
        >
          Get API Key
        </a>
      </div>
    );
  }

  return (
    <GoogleMap
      defaultCenter={center}
      defaultZoom={zoom}
      mapId="ride_map"
      disableDefaultUI={true}
      gestureHandling={'greedy'}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      className="w-full h-full rounded-2xl overflow-hidden"
    >
      <MapController markers={markers} center={center} followDriver={followDriver} />
      {markers.map((marker) => (
        <AdvancedMarker key={marker.id} position={{ lat: marker.lat, lng: marker.lng }}>
          <Pin background={marker.color || "#eab308"} glyphColor="#000" />
          {marker.label && (
            <div className="bg-black/80 text-white px-2 py-1 rounded text-[10px] mt-1 whitespace-nowrap border border-white/20 backdrop-blur-sm shadow-xl">
              {marker.label}
            </div>
          )}
        </AdvancedMarker>
      ))}
      {children}
    </GoogleMap>
  );
}

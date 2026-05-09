import { useEffect, useRef, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { motion } from 'motion/react';

interface RouteDisplayProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  color?: string;
  showCar?: boolean;
  carPosition?: google.maps.LatLngLiteral;
}

/**
 * Modern RouteDisplay component using Route.computeRoutes
 */
export default function RouteDisplay({ 
  origin, 
  destination, 
  travelMode = 'DRIVING', 
  color = '#eab308',
  showCar = false,
  carPosition
}: RouteDisplayProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

  const lastReroutePos = useRef<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Throttle: Only recalculate if destination changed OR if origin moved more than ~50m
    if (lastReroutePos.current) {
      const dist = Math.sqrt(
        Math.pow(origin.lat - lastReroutePos.current.lat, 2) + 
        Math.pow(origin.lng - lastReroutePos.current.lng, 2)
      );
      // Roughly 0.0005 degrees is ~50m
      if (dist < 0.0005) return;
    }
    
    lastReroutePos.current = origin;

    // Ensure numeric values
    const safeOrigin = { 
      lat: Number(origin.lat), 
      lng: Number(origin.lng) 
    };
    const safeDest = { 
      lat: Number(destination.lat), 
      lng: Number(destination.lng) 
    };

    if (isNaN(safeOrigin.lat) || isNaN(safeOrigin.lng) || isNaN(safeDest.lat) || isNaN(safeDest.lng)) {
      return;
    }

    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    // Use modern Route.computeRoutes
    routesLib.Route.computeRoutes({
      origin: safeOrigin,
      destination: safeDest,
      travelMode: travelMode as any,
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const route = routes[0];
        
        // Draw Polylines
        const newPolylines = route.createPolylines({
          polylineOptions: {
            strokeColor: color,
            strokeWeight: 6,
            strokeOpacity: 0.8,
          }
        });
        
        newPolylines.forEach(p => p.setMap(map));
        polylinesRef.current = newPolylines;

        // Store path for car positioning if needed
        if (route.path) {
          const path = route.path.map(p => {
            const lat = typeof p.lat === 'function' ? p.lat() : (p as any).lat;
            const lng = typeof p.lng === 'function' ? p.lng() : (p as any).lng;
            return { lat, lng };
          });
          setRoutePath(path);
        }

        // Fit map bounds if explicitly needed (optional, maybe distracting during active ride)
        // map.fitBounds(route.viewport);
      }
    }).catch(err => {
      console.error('Error computing route:', err);
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin.lat, origin.lng, destination.lat, destination.lng, travelMode, color]);

  return null;
}

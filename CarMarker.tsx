import React, { useEffect, useState, useRef } from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { motion, useSpring, useTransform } from 'motion/react';

interface CarMarkerProps {
  position: google.maps.LatLngLiteral;
  label?: string;
  isDriver?: boolean;
}

export default function CarMarker({ position, label }: CarMarkerProps) {
  const [rotation, setRotation] = useState(0);
  const prevPos = useRef<google.maps.LatLngLiteral>(position);

  // Smooth position tracking with springs
  const springConfig = { stiffness: 50, damping: 20 };
  const latSpring = useSpring(position.lat, springConfig);
  const lngSpring = useSpring(position.lng, springConfig);

  useEffect(() => {
    latSpring.set(position.lat);
    lngSpring.set(position.lng);

    // Calculate rotation (bearing)
    if (prevPos.current.lat !== position.lat || prevPos.current.lng !== position.lng) {
      const dy = position.lat - prevPos.current.lat;
      const dx = Math.cos((Math.PI / 180) * prevPos.current.lat) * (position.lng - prevPos.current.lng);
      const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
      
      // If movement is significant, update rotation
      if (Math.abs(dx) > 0.000001 || Math.abs(dy) > 0.000001) {
        setRotation(angle);
      }
      
      prevPos.current = position;
    }
  }, [position, latSpring, lngSpring]);

  return (
    <AdvancedMarker 
      position={position}
      anchorPoint={typeof google !== 'undefined' && google.maps ? google.maps.MarkerAnchorPoint.CENTER : undefined}
    >
      <div className="relative flex flex-col items-center">
        {label && (
          <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 border border-white/10 whitespace-nowrap shadow-xl backdrop-blur-sm">
            {label}
          </div>
        )}
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          className="relative w-12 h-12 flex items-center justify-center"
        >
          {/* Car Shadow */}
          <div className="absolute inset-0 bg-black/40 blur-lg rounded-full transform translate-y-2 scale-75"></div>
          
          {/* Car Body SVG (Top View) - Professional Styling */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#facc15', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ca8a04', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            {/* Base Body */}
            <rect x="25" y="12" width="50" height="76" rx="16" fill="#111" />
            <rect x="28" y="15" width="44" height="70" rx="13" fill="url(#carGradient)" />
            
            {/* Front & Rear Windows */}
            <rect x="34" y="24" width="32" height="18" rx="6" fill="#1e293b" />
            <rect x="34" y="60" width="32" height="14" rx="5" fill="#1e293b" />
            
            {/* Side Windows */}
            <rect x="28" y="38" width="4" height="25" rx="1" fill="#1e293b" opacity="0.6" />
            <rect x="68" y="38" width="4" height="25" rx="1" fill="#1e293b" opacity="0.6" />
            
            {/* Headlights (White/Yellow) */}
            <rect x="29" y="16" width="10" height="6" rx="2" fill="white" className="animate-pulse" />
            <rect x="61" y="16" width="10" height="6" rx="2" fill="white" className="animate-pulse" />
            
            {/* Rearlights (Red) */}
            <rect x="29" y="78" width="10" height="6" rx="2" fill="#ef4444" />
            <rect x="61" y="78" width="10" height="6" rx="2" fill="#ef4444" />
            
            {/* Roof Detail */}
            <rect x="42" y="45" width="16" height="12" rx="2" fill="#000" opacity="0.1" />
          </svg>
        </motion.div>
      </div>
    </AdvancedMarker>
  );
}

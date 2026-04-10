import React, { useState, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPicker = ({ address, onChange }: { address: string, onChange: (val: string) => void }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const typingTimeoutRef = useRef<any>(null);
    const isClickingRef = useRef(false);
    
    const [isLocating, setIsLocating] = useState(false);
    const defaultCenter: [number, number] = [29.7604, -95.3698]; // Houston default
    
    useEffect(() => {
        let resizeObserver: ResizeObserver;
        
        if (!mapRef.current) {
            mapRef.current = L.map('map-container', { zoomControl: false }).setView(defaultCenter, 13);
            
            // Minimalist light map style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: ''
            }).addTo(mapRef.current);
            
            markerRef.current = L.circleMarker(defaultCenter, { 
                radius: 8, color: '#242321', fillColor: '#F4EFEB', fillOpacity: 1, weight: 2
            }).addTo(mapRef.current);

            // Fix grey tiles issue using ResizeObserver to ensure map always fits container
            const container = document.getElementById('map-container');
            if (container) {
                resizeObserver = new ResizeObserver(() => {
                    if (mapRef.current) mapRef.current.invalidateSize();
                });
                resizeObserver.observe(container);
            }
            
            // Additional timeout fallback for initial render
            setTimeout(() => {
                if (mapRef.current) mapRef.current.invalidateSize();
            }, 100);
            setTimeout(() => {
                if (mapRef.current) mapRef.current.invalidateSize();
            }, 500);
            
            mapRef.current.on('click', async (e: any) => {
                const { lat, lng } = e.latlng;
                
                // Fly to clicked location smoothly
                mapRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
                markerRef.current.setLatLng([lat, lng]);
                
                isClickingRef.current = true; // Prevent reverse-triggering the geocoder effect
                onChange("Ubicando...");
                setIsLocating(true);
                
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        const parts = data.display_name.split(',');
                        onChange(parts.slice(0, 3).join(','));
                    } else {
                        onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    }
                } catch (err) {
                    onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                } finally {
                    setIsLocating(false);
                    // Let the geocoder listen to input changes again after a short delay
                    setTimeout(() => isClickingRef.current = false, 800);
                }
            });
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Geocode typed text address to move map (two-way sync)
    useEffect(() => {
        if (isClickingRef.current || !address || address === "Ubicando...") return;
        
        // Allow coordinates directly
        const coordsMatch = address.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
        if (coordsMatch) {
            const lat = parseFloat(coordsMatch[1]);
            const lng = parseFloat(coordsMatch[3]);
            if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
            if (mapRef.current) mapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
            return;
        }

        // Debounced text search query
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(async () => {
            setIsLocating(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                const dataArray = await res.json();
                const data = dataArray[0];
                if (data && mapRef.current && markerRef.current) {
                    const lat = parseFloat(data.lat);
                    const lng = parseFloat(data.lon);
                    markerRef.current.setLatLng([lat, lng]);
                    mapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
                }
            } catch (e) {
                console.error("Geocoding unsuccesful or throttled.");
            } finally {
                setIsLocating(false);
            }
        }, 1200); // 1.2s wait after user finishes typing
        
        return () => clearTimeout(typingTimeoutRef.current);
    }, [address]);

    const handleLocateMe = (e: React.MouseEvent) => {
        e.preventDefault();
        if(navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Trigger the map click logic programmatically onto user's real location
                    if (mapRef.current) mapRef.current.fire('click', { latlng: L.latLng(latitude, longitude) });
                },
                () => {
                    alert("No se pudo obtener la ubicación. Verifique sus permisos.");
                    setIsLocating(false);
                }
            );
        }
    };

    return (
        <div className="w-full h-full relative z-0">
            <div id="map-container" className="absolute inset-0 bg-arch-bg z-0"></div>
            
            {/* Visual Loading Feedback */}
            {isLocating && (
                <div className="absolute top-6 left-6 z-[1000] bg-arch-dark text-white text-[10px] uppercase tracking-widest px-4 py-2 font-semibold shadow-float flex items-center gap-2 slide-up">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Sincronizando
                </div>
            )}
            
            {/* Geolocation Button */}
            <button onClick={handleLocateMe}
                 className="absolute bottom-6 right-6 z-[1000] bg-arch-surface text-arch-text border border-arch-border hover:border-arch-text text-[10px] font-bold tracking-widest uppercase px-5 py-3 shadow-float hover:bg-arch-text hover:text-white transition-all flex items-center gap-2">
                Mi Ubicación
            </button>
        </div>
    );
};

export default MapPicker;

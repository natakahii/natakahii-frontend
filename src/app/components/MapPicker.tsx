import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter,
} from './ui/drawer';
import { getCurrentPosition } from '../services/locationService';

const pinIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F05A28" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapEvents({ onClick }: { onClick: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export function MapPickerDrawer({
  open,
  onOpenChange,
  onConfirm,
  initialCoords,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (coords: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number } | null;
}) {
  const defaultCenter: [number, number] = initialCoords
    ? [initialCoords.lat, initialCoords.lng]
    : [-6.7924, 39.2083]; // Dar es Salaam

  const [position, setPosition] = useState<[number, number] | null>(
    initialCoords ? [initialCoords.lat, initialCoords.lng] : null
  );
  const [locLoading, setLocLoading] = useState(false);

  const handleMapClick = useCallback((latlng: L.LatLng) => {
    setPosition([latlng.lat, latlng.lng]);
  }, []);

  const handleUseMyLocation = async () => {
    setLocLoading(true);
    try {
      const coords = await getCurrentPosition();
      setPosition([coords.lat, coords.lng]);
    } catch (err: any) {
      // Error is handled silently; user can still tap on map
    } finally {
      setLocLoading(false);
    }
  };

  const handleConfirm = () => {
    if (position) {
      onConfirm({ lat: position[0], lng: position[1] });
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white max-h-[92vh]">
        <DrawerHeader className="border-b border-[var(--color-border)] pb-4">
          <DrawerTitle className="text-center text-[18px] text-[var(--color-text-heading)]">
            Pick Your Location
          </DrawerTitle>
          <DrawerDescription className="text-center text-[13px] text-[var(--color-text-muted)]">
            Tap anywhere on the map to drop a pin. Drag the pin to fine-tune.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          <div
            className="relative rounded-[16px] overflow-hidden border-2 border-[var(--color-border)]"
            style={{ height: '320px' }}
          >
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEvents onClick={handleMapClick} />
              {position && (
                <Marker
                  position={position}
                  icon={pinIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target as L.Marker;
                      const latlng = marker.getLatLng();
                      setPosition([latlng.lat, latlng.lng]);
                    },
                  }}
                />
              )}
            </MapContainer>
          </div>

          {position && (
            <div className="bg-[var(--color-primary-bg)] rounded-[12px] p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-[13px] text-[var(--color-text-heading)] font-medium">
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </span>
            </div>
          )}

          <button
            onClick={handleUseMyLocation}
            disabled={locLoading}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-[12px] border-2 border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-white disabled:opacity-50"
          >
            {locLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span className="text-[13px] font-semibold">Use My Current Location</span>
          </button>
        </div>

        <DrawerFooter className="border-t border-[var(--color-border)] p-4 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 p-3 rounded-[12px] border-2 border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-white text-[14px] font-semibold"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            size="xl"
            className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
            onClick={handleConfirm}
            disabled={!position}
          >
            Confirm Location
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

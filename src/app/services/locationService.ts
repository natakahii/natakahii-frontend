import {
  getRegions,
  getDistricts,
  getWards,
  getNearestPickupStation,
  getPickupStations,
  PickupStation,
} from '../data/tanzaniaLocations';

export { type PickupStation };

export const locationService = {
  async fetchRegions(): Promise<string[]> {
    return getRegions();
  },

  async fetchDistricts(region: string): Promise<string[]> {
    return getDistricts(region);
  },

  async fetchWards(region: string, district: string): Promise<string[]> {
    return getWards(region, district);
  },

  async fetchPickupStations(region: string, district: string, ward: string): Promise<PickupStation[]> {
    return getPickupStations(region, district, ward);
  },

  async fetchNearestPickupStation(region: string, district: string, ward: string): Promise<PickupStation | null> {
    return getNearestPickupStation(region, district, ward);
  },
};

export async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Failed to get location')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function openGoogleMapsPicker(lat?: number, lng?: number) {
  const query = lat != null && lng != null ? `${lat},${lng}` : '';
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

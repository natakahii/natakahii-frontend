export interface TanzaniaWard {
  name: string;
}

export interface TanzaniaDistrict {
  name: string;
  wards: TanzaniaWard[];
}

export interface TanzaniaRegion {
  name: string;
  districts: TanzaniaDistrict[];
}

export const tanzaniaRegions: TanzaniaRegion[] = [
  {
    name: 'Dar es Salaam',
    districts: [
      {
        name: 'Ilala',
        wards: [
          { name: 'Upanga East' }, { name: 'Upanga West' }, { name: 'Kisutu' },
          { name: 'Kariakoo' }, { name: 'Jangwani' }, { name: 'Gerezani' },
          { name: 'Mchikichini' }, { name: 'Segerea' }, { name: 'Tabata' },
          { name: 'Buguruni' }, { name: 'Vingunguti' }, { name: 'Kimanga' },
        ],
      },
      {
        name: 'Kinondoni',
        wards: [
          { name: 'Mikocheni' }, { name: 'Msasani' }, { name: 'Kijitonyama' },
          { name: 'Sinza' }, { name: 'Ubungo' }, { name: 'Tandale' },
          { name: 'Manzese' }, { name: 'Mabibo' }, { name: 'Kigogo' },
          { name: 'Mwananyamala' }, { name: 'Hananasif' }, { name: 'Magomeni' },
        ],
      },
      {
        name: 'Temeke',
        wards: [
          { name: 'Temeke' }, { name: 'Kurasini' }, { name: 'Mbagala' },
          { name: 'Chang\'ombe' }, { name: 'Keko' }, { name: 'Sandali' },
          { name: 'Azimio' }, { name: 'Mtoni' }, { name: 'Tandika' },
          { name: 'Yombo Vituka' }, { name: 'Buza' }, { name: 'Toangoma' },
        ],
      },
      {
        name: 'Kigamboni',
        wards: [
          { name: 'Kigamboni' }, { name: 'Vijibweni' }, { name: 'Tungi' },
          { name: 'Pembamnazi' }, { name: 'Somangila' }, { name: 'Kibada' },
          { name: 'Kisarawe II' }, { name: 'Miburani' }, { name: 'Kibondeni' },
        ],
      },
      {
        name: 'Ubungo',
        wards: [
          { name: 'Ubungo' }, { name: 'Makurumla' }, { name: 'Mburahati' },
          { name: 'Manzese' }, { name: 'Kijitonyama' }, { name: 'Sinza' },
        ],
      },
    ],
  },
  {
    name: 'Arusha',
    districts: [
      {
        name: 'Arusha City',
        wards: [
          { name: 'Kaloleni' }, { name: 'Levolosi' }, { name: 'Sakina' },
          { name: 'Kati' }, { name: 'Sekei' }, { name: 'Oloirien' },
          { name: 'Kimandolu' }, { name: 'Elerai' }, { name: 'Olorien' },
        ],
      },
      {
        name: 'Arumeru',
        wards: [
          { name: 'Maji Ya Chai' }, { name: 'Makiba' }, { name: 'Kisongo' },
          { name: 'Poli' }, { name: 'Musai' }, { name: 'Bwawani' },
        ],
      },
      {
        name: 'Monduli',
        wards: [
          { name: 'Monduli Mjini' }, { name: 'Engaruka' }, { name: 'Lashaine' },
          { name: 'Muringa' }, { name: 'Sepeko' }, { name: 'Majengo' },
        ],
      },
    ],
  },
  {
    name: 'Mwanza',
    districts: [
      {
        name: 'Nyamagana',
        wards: [
          { name: 'Nyamagana' }, { name: 'Butimba' }, { name: 'Mkolani' },
          { name: 'Mbugani' }, { name: 'Pamba' }, { name: 'Igogo' },
          { name: 'Buhongwa' }, { name: 'Nyegezi' }, { name: 'Kirumba' },
        ],
      },
      {
        name: 'Ilemela',
        wards: [
          { name: 'Ilemela' }, { name: 'Buswelu' }, { name: 'Sangamwalugesha' },
          { name: 'Kitangiri' }, { name: 'Bugogwa' }, { name: 'Kawekamo' },
        ],
      },
    ],
  },
  {
    name: 'Dodoma',
    districts: [
      {
        name: 'Dodoma Urban',
        wards: [
          { name: 'Kizota' }, { name: 'Makole' }, { name: 'Kiwanja cha Ndege' },
          { name: 'Madukani' }, { name: 'Mpunguzi' }, { name: 'Miyuji' },
          { name: 'Msalato' }, { name: 'Ipagala' }, { name: 'Hazina' },
        ],
      },
      {
        name: 'Chamwino',
        wards: [
          { name: 'Chamwino' }, { name: 'Nzuguni' }, { name: 'Lamaiti' },
          { name: 'Mvumi' }, { name: 'Ngh\'ambi' }, { name: 'Zajilwa' },
        ],
      },
    ],
  },
  {
    name: 'Moshi',
    districts: [
      {
        name: 'Moshi Urban',
        wards: [
          { name: 'Moshi Mjini' }, { name: 'Mji Mpya' }, { name: 'Pasua' },
          { name: 'Bondeni' }, { name: 'Soweto' }, { name: 'Longuo' },
          { name: 'Kilimanjaro' }, { name: 'Rau' }, { name: 'Msaranga' },
        ],
      },
      {
        name: 'Moshi Rural',
        wards: [
          { name: 'Mabogini' }, { name: 'Kibosho' }, { name: 'Kindi' },
          { name: 'Uru' }, { name: 'Mwika' }, { name: 'Kilema' },
        ],
      },
    ],
  },
  {
    name: 'Morogoro',
    districts: [
      {
        name: 'Morogoro Urban',
        wards: [
          { name: 'Sultan Area' }, { name: 'Kihonda' }, { name: 'Mazimbu' },
          { name: 'Mji Mkuu' }, { name: 'Mlimani' }, { name: 'Bigwa' },
          { name: 'Boma' }, { name: 'Kilakala' }, { name: 'Tungi' },
        ],
      },
      {
        name: 'Mvomero',
        wards: [
          { name: 'Mvomero' }, { name: 'Kanga' }, { name: 'Mlali' },
          { name: 'Diongoya' }, { name: 'Mzumbe' }, { name: 'Kikeo' },
        ],
      },
    ],
  },
  {
    name: 'Mbeya',
    districts: [
      {
        name: 'Mbeya City',
        wards: [
          { name: 'Iyunga' }, { name: 'Iduda' }, { name: 'Isanga' },
          { name: 'Ilemi' }, { name: 'Itende' }, { name: 'Iziwaya' },
          { name: 'Kalobe' }, { name: 'Maendeleo' }, { name: 'Mwasanga' },
        ],
      },
      {
        name: 'Mbeya Rural',
        wards: [
          { name: 'Tukuyu' }, { name: 'Masoko' }, { name: 'Bulyaga' },
          { name: 'Lupembe' }, { name: 'Ilembo' }, { name: 'Busoka' },
        ],
      },
    ],
  },
  {
    name: 'Tanga',
    districts: [
      {
        name: 'Tanga City',
        wards: [
          { name: 'Mwanzoni' }, { name: 'Mzingani' }, { name: 'Mabawa' },
          { name: 'Makorora' }, { name: 'Ngamiani' }, { name: 'Tangasisi' },
          { name: 'Mkwakwani' }, { name: 'Chumbageni' }, { name: 'Pongwe' },
        ],
      },
      {
        name: 'Muheza',
        wards: [
          { name: 'Muheza' }, { name: 'Kisiwani' }, { name: 'Majengo' },
          { name: 'Masuguru' }, { name: 'Magila' }, { name: 'Lusanga' },
        ],
      },
    ],
  },
  {
    name: 'Zanzibar',
    districts: [
      {
        name: 'Zanzibar Urban/West',
        wards: [
          { name: 'Malindi' }, { name: 'Shangani' }, { name: 'Mji Mkongwe' },
          { name: 'Mpendae' }, { name: 'Kiembe Samaki' }, { name: 'Mwembesongo' },
          { name: 'Amaani' }, { name: 'Chumbuni' }, { name: 'Kilimani' },
        ],
      },
      {
        name: 'Zanzibar North',
        wards: [
          { name: 'Kivunge' }, { name: 'Kianga' }, { name: 'Mkwajuni' },
          { name: 'Matemwe' }, { name: 'Nungwi' }, { name: 'Kendwa' },
        ],
      },
    ],
  },
];

export function getRegions(): string[] {
  return tanzaniaRegions.map((r) => r.name);
}

export function getDistricts(regionName: string): string[] {
  const region = tanzaniaRegions.find((r) => r.name === regionName);
  return region ? region.districts.map((d) => d.name) : [];
}

export function getWards(regionName: string, districtName: string): string[] {
  const region = tanzaniaRegions.find((r) => r.name === regionName);
  const district = region?.districts.find((d) => d.name === districtName);
  return district ? district.wards.map((w) => w.name) : [];
}

/* ── pickup stations (mock data) ── */
export interface PickupStation {
  id: string;
  name: string;
  region: string;
  district: string;
  ward: string;
  lat?: number;
  lng?: number;
}

const pickupStations: PickupStation[] = [
  { id: 'ps1', name: 'Dar Central Hub', region: 'Dar es Salaam', district: 'Ilala', ward: 'Kariakoo', lat: -6.8235, lng: 39.2695 },
  { id: 'ps2', name: 'Kinondoni Drop Point', region: 'Dar es Salaam', district: 'Kinondoni', ward: 'Mikocheni', lat: -6.765, lng: 39.25 },
  { id: 'ps3', name: 'Temeke Station', region: 'Dar es Salaam', district: 'Temeke', ward: 'Temeke', lat: -6.865, lng: 39.26 },
  { id: 'ps4', name: 'Arusha Town Center', region: 'Arusha', district: 'Arusha City', ward: 'Kaloleni', lat: -3.3667, lng: 36.6833 },
  { id: 'ps5', name: 'Mwanza Port Pickup', region: 'Mwanza', district: 'Nyamagana', ward: 'Nyamagana', lat: -2.5167, lng: 32.9 },
  { id: 'ps6', name: 'Dodoma Main Office', region: 'Dodoma', district: 'Dodoma Urban', ward: 'Madukani', lat: -6.163, lng: 35.751 },
  { id: 'ps7', name: 'Moshi Mountain Hub', region: 'Moshi', district: 'Moshi Urban', ward: 'Moshi Mjini', lat: -3.35, lng: 37.3333 },
  { id: 'ps8', name: 'Morogoro Campus Point', region: 'Morogoro', district: 'Morogoro Urban', ward: 'Kihonda', lat: -6.8235, lng: 37.6579 },
  { id: 'ps9', name: 'Mbeya Highlands', region: 'Mbeya', district: 'Mbeya City', ward: 'Iyunga', lat: -8.9, lng: 33.45 },
  { id: 'ps10', name: 'Tanga Beach Drop', region: 'Tanga', district: 'Tanga City', ward: 'Mzingani', lat: -5.0667, lng: 39.1 },
  { id: 'ps11', name: 'Zanzibar Stone Town', region: 'Zanzibar', district: 'Zanzibar Urban/West', ward: 'Malindi', lat: -6.1659, lng: 39.1994 },
];

export function getPickupStations(region?: string, district?: string, ward?: string): PickupStation[] {
  return pickupStations.filter((s) => {
    if (region && s.region !== region) return false;
    if (district && s.district !== district) return false;
    if (ward && s.ward !== ward) return false;
    return true;
  });
}

export function getNearestPickupStation(region: string, district: string, ward: string): PickupStation | null {
  const matches = getPickupStations(region, district, ward);
  return matches.length > 0 ? matches[0] : getPickupStations(region, district)[0] || getPickupStations(region)[0] || null;
}

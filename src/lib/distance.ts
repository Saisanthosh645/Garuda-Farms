// ─── Garuda Farms Distance & Dynamic Delivery Fee Engine ───────────────────────
// Base Sanctuary Location: Mudimyala, Chevella, Ranga Reddy, Telangana (501503)

export const STORE_PINCODE = '501503';
export const STORE_LOCATION_NAME = 'Garuda Sanctuary, Mudimyala, Chevella';
export const DEFAULT_RATE_PER_KM = 10; // ₹10 per km
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000; // ₹1000 for FREE delivery

export interface DistanceInfo {
  name: string;
  distanceKm: number;
}

// Authoritative Pincode to Distance Mapping from Mudimyala Sanctuary Bay (501503)
export const PINCODE_DISTANCE_MAP: Record<string, DistanceInfo> = {
  '501503': { name: 'Mudimyala / Chevella Sanctuary', distanceKm: 4 },
  '501504': { name: 'Chevella Town / Aloor', distanceKm: 6 },
  '501508': { name: 'Shabad / Shahbad', distanceKm: 18 },
  '501510': { name: 'Shankarpally / Janwada', distanceKm: 14 },
  '501218': { name: 'Tellapur / Kollur', distanceKm: 22 },
  '500075': { name: 'Moinabad / Chilkur', distanceKm: 16 },
  '500089': { name: 'Manikonda / Puppalguda / Narsingi', distanceKm: 24 },
  '500032': { name: 'Gachibowli / Financial District', distanceKm: 26 },
  '500081': { name: 'Madhapur / Hitec City', distanceKm: 30 },
  '500084': { name: 'Kondapur / Botanical Garden', distanceKm: 32 },
  '500033': { name: 'Jubilee Hills', distanceKm: 32 },
  '500034': { name: 'Banjara Hills / Punjagutta', distanceKm: 34 },
  '500008': { name: 'Mehdipatnam / Tolichowki', distanceKm: 28 },
  '500028': { name: 'Masab Tank / Asif Nagar', distanceKm: 32 },
  '500001': { name: 'Abids / Koti / Nampally', distanceKm: 38 },
  '500002': { name: 'Charminar / Falaknuma', distanceKm: 38 },
  '500003': { name: 'Secunderabad / Paradise', distanceKm: 44 },
  '500004': { name: 'Lakdikapul / Khairatabad', distanceKm: 35 },
  '500016': { name: 'Begumpet / Prakash Nagar', distanceKm: 40 },
  '500038': { name: 'Ameerpet / SR Nagar', distanceKm: 36 },
  '500072': { name: 'Kukatpally / KPHB Colony', distanceKm: 38 },
  '500049': { name: 'Miyapur / Chanda Nagar', distanceKm: 36 },
  '500050': { name: 'Lingampally / BHEL', distanceKm: 34 },
  '500090': { name: 'Nizampet / Bachupally', distanceKm: 42 },
  '500055': { name: 'Jeedimetla / Quthbullapur', distanceKm: 45 },
  '500015': { name: 'Sainikpuri / ECIL / AS Rao Nagar', distanceKm: 52 },
  '500068': { name: 'LB Nagar / Dilsukhnagar / Kothapet', distanceKm: 48 },
  '500039': { name: 'Uppal / Ramanthapur / Tarnaka', distanceKm: 48 },
  '500070': { name: 'Hayathnagar / Vanasthalipuram', distanceKm: 52 },
  '501505': { name: 'Vikarabad / Pargi', distanceKm: 35 },
};

export interface DistanceDeliveryResult {
  pincode: string;
  locationName: string;
  distanceKm: number;
  ratePerKm: number;
  calculatedFee: number; // distanceKm * ratePerKm
  finalFee: number; // 0 if subtotal >= freeShippingThreshold, else calculatedFee
  isFreeDelivery: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeDelivery: number;
}

export function calculateDeliveryFeeByPincode(
  pincode: string,
  subtotal: number,
  customRatePerKm = DEFAULT_RATE_PER_KM,
  customFreeThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD
): DistanceDeliveryResult {
  const cleanPin = String(pincode || '').trim().replace(/\D/g, '');

  let distanceKm = 4; // Default minimum estimated distance
  let locationName = 'Mudimyala Sanctuary Bay';

  if (cleanPin && PINCODE_DISTANCE_MAP[cleanPin]) {
    distanceKm = PINCODE_DISTANCE_MAP[cleanPin].distanceKm;
    locationName = PINCODE_DISTANCE_MAP[cleanPin].name;
  } else if (cleanPin.length === 6) {
    const pinNum = parseInt(cleanPin, 10);
    if (cleanPin.startsWith('500')) {
      distanceKm = 25 + (pinNum % 20); // 25-45 km for Hyderabad metro
      locationName = `Hyderabad Zone (${cleanPin})`;
    } else if (cleanPin.startsWith('501')) {
      distanceKm = 8 + (pinNum % 25); // 8-33 km for Ranga Reddy
      locationName = `Ranga Reddy Zone (${cleanPin})`;
    } else if (cleanPin.startsWith('50')) {
      distanceKm = 35 + (pinNum % 30);
      locationName = `Telangana Region (${cleanPin})`;
    } else {
      distanceKm = 50 + (pinNum % 40);
      locationName = `Inter-District Zone (${cleanPin})`;
    }
  }

  const ratePerKm = customRatePerKm > 0 ? customRatePerKm : DEFAULT_RATE_PER_KM;
  const calculatedFee = Math.max(40, Math.round(distanceKm * ratePerKm));
  const isFreeDelivery = subtotal >= customFreeThreshold && subtotal > 0;
  const finalFee = isFreeDelivery || subtotal === 0 ? 0 : calculatedFee;
  const amountNeededForFreeDelivery = Math.max(0, customFreeThreshold - subtotal);

  return {
    pincode: cleanPin,
    locationName,
    distanceKm,
    ratePerKm,
    calculatedFee,
    finalFee,
    isFreeDelivery,
    freeShippingThreshold: customFreeThreshold,
    amountNeededForFreeDelivery,
  };
}

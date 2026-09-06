// ─── Garuda Farms Server-Side Distance & Dynamic Delivery Fee Engine ───────────
import { getSupabase } from '../db/supabase';

export const STORE_PINCODE = '501503';
export const DEFAULT_RATE_PER_KM = 10; // ₹10 per km
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000; // ₹1000 for FREE delivery

export interface ServerDeliveryCalculation {
  ok: boolean;
  serviceable: boolean;
  pincode: string;
  locationName: string;
  distanceKm: number;
  ratePerKm: number;
  calculatedFee: number;
  finalFee: number;
  isFreeDelivery: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeDelivery: number;
  error?: string;
}

// Initial seed mapping for the 45 Hyderabad + Ranga Reddy PIN codes
export const PINCODE_DISTANCE_MAP: Record<string, { name: string; distanceKm: number }> = {
  '501503': { name: 'Mudimyala / Chevella Sanctuary', distanceKm: 4.0 },
  '501504': { name: 'Chevella Town / Aloor', distanceKm: 6.0 },
  '501501': { name: 'Chevella Rural / Shankarpally Road', distanceKm: 12.0 },
  '501505': { name: 'Vikarabad Road / Pargi', distanceKm: 35.0 },
  '501506': { name: 'Nawabpet / Chevella East', distanceKm: 16.0 },
  '501508': { name: 'Shabad / Shahbad', distanceKm: 18.0 },
  '501509': { name: 'Aloor / Chevella South', distanceKm: 10.0 },
  '501510': { name: 'Shankarpally / Janwada', distanceKm: 14.0 },
  '501512': { name: 'Kandada / Chevella North', distanceKm: 15.0 },
  '501513': { name: 'Damagundam / Forest Sanctuary', distanceKm: 8.0 },
  '501203': { name: 'Vikarabad / Ananthagiri Hills', distanceKm: 32.0 },
  '501218': { name: 'Tellapur / Kollur', distanceKm: 22.0 },
  '501359': { name: 'Mokila / Tangatur', distanceKm: 18.0 },
  '500005': { name: 'Chandrayangutta / Barkas', distanceKm: 38.0 },
  '500019': { name: 'Erragadda / Sanathnagar', distanceKm: 38.0 },
  '500030': { name: 'Rajendranagar / Pillar 200 / SVVU', distanceKm: 26.0 },
  '500032': { name: 'Gachibowli / Financial District', distanceKm: 26.0 },
  '500035': { name: 'Saroornagar / Kothapet', distanceKm: 46.0 },
  '500046': { name: 'Chandanagar / Serilingampally', distanceKm: 34.0 },
  '500048': { name: 'Old Bowenpally / Military Dairy Farm', distanceKm: 42.0 },
  '500052': { name: 'Bowenpally / Hasmathpet', distanceKm: 44.0 },
  '500058': { name: 'Uppal Kalan / IDA Uppal', distanceKm: 48.0 },
  '500060': { name: 'Dilsukhnagar / Malakpet', distanceKm: 44.0 },
  '500069': { name: 'Musheerabad / Kavadiguda', distanceKm: 42.0 },
  '500070': { name: 'Hayathnagar / Vanasthalipuram', distanceKm: 52.0 },
  '500074': { name: 'LB Nagar / Nagole', distanceKm: 48.0 },
  '500075': { name: 'Moinabad / Chilkur Balaji', distanceKm: 16.0 },
  '500077': { name: 'Bandlaguda Jagir / Sun City', distanceKm: 24.0 },
  '500079': { name: 'Karmanghat / Champapet', distanceKm: 46.0 },
  '500084': { name: 'Kondapur / Botanical Garden', distanceKm: 32.0 },
  '500086': { name: 'Hafeezpet / Madinaguda', distanceKm: 35.0 },
  '500089': { name: 'Manikonda / Puppalguda / Narsingi', distanceKm: 24.0 },
  '500090': { name: 'Nizampet / Bachupally', distanceKm: 42.0 },
  '500091': { name: 'Kismatpur / Peeramcheru', distanceKm: 22.0 },
  '500092': { name: 'Bowrampet / Gandimaisamma', distanceKm: 48.0 },
  '500097': { name: 'Attapur / Hyderguda', distanceKm: 28.0 },
  '500098': { name: 'Hydershakote / Manchirevula', distanceKm: 22.0 },
  '500100': { name: 'Miyapur / Hafeezpet West', distanceKm: 36.0 },
  '500102': { name: 'Nallagandla / Tellapur Extension', distanceKm: 25.0 },
  '500104': { name: 'Kokapet / Neopolis', distanceKm: 22.0 },
  '500107': { name: 'Narsingi / Ocean Park', distanceKm: 24.0 },
  '500108': { name: 'Financial District Phase 2 / Nanakramguda', distanceKm: 25.0 },
  '500111': { name: 'Puppalguda Golden Mile', distanceKm: 24.0 },
  '500112': { name: 'Kollur ORR Junction', distanceKm: 20.0 },
  '500113': { name: 'Velimela / Pati', distanceKm: 20.0 },
};

/**
 * Dynamically fetches rate per km & free shipping threshold from store_settings DB table
 */
export async function getDeliverySettingsFromDb(): Promise<{ ratePerKm: number; freeThreshold: number; originAddress: string }> {
  const supabase = getSupabase();
  let ratePerKm = DEFAULT_RATE_PER_KM;
  let freeThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD;
  let originAddress = 'Garuda Sanctuary, Mudimyala, Chevella (501503)';

  if (!supabase) {
    return { ratePerKm, freeThreshold, originAddress };
  }

  try {
    const { data } = await supabase
      .from('store_settings')
      .select('key, value')
      .in('key', ['delivery_rate_per_km', 'free_delivery_threshold', 'delivery_origin_address']);

    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.key === 'delivery_rate_per_km') {
          const val = typeof row.value === 'number' ? row.value : parseFloat(row.value);
          if (!isNaN(val) && val >= 0) ratePerKm = val;
        } else if (row.key === 'free_delivery_threshold') {
          const val = typeof row.value === 'number' ? row.value : parseFloat(row.value);
          if (!isNaN(val)) freeThreshold = val;
        } else if (row.key === 'delivery_origin_address') {
          if (typeof row.value === 'string') originAddress = row.value.replace(/^"|"$/g, '');
        }
      });
    }
  } catch (err) {
    console.warn('[Delivery Settings DB fetch warning]:', err);
  }

  return { ratePerKm, freeThreshold, originAddress };
}

/**
 * Server-side dynamic delivery fee calculation & PIN serviceability check
 */
export async function calculateServerDeliveryFee(
  pincode: string,
  subtotal: number,
  couponCode?: string
): Promise<ServerDeliveryCalculation> {
  const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
  const supabase = getSupabase();
  const cleanCoupon = String(couponCode || '').trim().toUpperCase();

  if (!cleanPin || cleanPin.length !== 6) {
    return {
      ok: false,
      serviceable: false,
      pincode: cleanPin,
      locationName: '',
      distanceKm: 0,
      ratePerKm: DEFAULT_RATE_PER_KM,
      calculatedFee: 0,
      finalFee: 0,
      isFreeDelivery: false,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      amountNeededForFreeDelivery: DEFAULT_FREE_SHIPPING_THRESHOLD,
      error: 'Please enter a valid 6-digit PIN code.',
    };
  }

  const settings = await getDeliverySettingsFromDb();

  let distanceKm = 0;
  let locationName = '';
  let isServiceable = false;

  // 1. Try DB lookup first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('serviceable_pincodes')
        .select('*')
        .eq('pincode', cleanPin)
        .maybeSingle();

      if (!error && data) {
        if (data.is_enabled === false) {
          return {
            ok: false,
            serviceable: false,
            pincode: cleanPin,
            locationName: data.area_name || 'Restricted Area',
            distanceKm: Number(data.distance_km) || 0,
            ratePerKm: settings.ratePerKm,
            calculatedFee: 0,
            finalFee: 0,
            isFreeDelivery: false,
            freeShippingThreshold: settings.freeThreshold,
            amountNeededForFreeDelivery: Math.max(0, settings.freeThreshold - subtotal),
            error: 'Delivery is not available to this location.',
          };
        }

        isServiceable = true;
        distanceKm = Number(data.distance_km);
        locationName = data.area_name;
      }
    } catch (dbErr) {
      console.warn('[Pincode DB lookup warning]:', dbErr);
    }
  }

  // 2. Fallback to hardcoded seed mapping if DB not present or PIN not found in DB yet
  if (!isServiceable) {
    if (PINCODE_DISTANCE_MAP[cleanPin]) {
      isServiceable = true;
      distanceKm = PINCODE_DISTANCE_MAP[cleanPin].distanceKm;
      locationName = PINCODE_DISTANCE_MAP[cleanPin].name;
    } else {
      return {
        ok: false,
        serviceable: false,
        pincode: cleanPin,
        locationName: '',
        distanceKm: 0,
        ratePerKm: settings.ratePerKm,
        calculatedFee: 0,
        finalFee: 0,
        isFreeDelivery: false,
        freeShippingThreshold: settings.freeThreshold,
        amountNeededForFreeDelivery: Math.max(0, settings.freeThreshold - subtotal),
        error: 'Delivery is not available to this location.',
      };
    }
  }

  const ratePerKm = settings.ratePerKm;
  // Calculate delivery fee dynamically based on distance from Garuda Farms origin: ₹10/km
  const calculatedFee = Math.round(distanceKm * ratePerKm);
  // FREE delivery is granted ONLY when secret coupon GARUDAFREE is entered and subtotal >= 500
  const isFreeDelivery = cleanCoupon === 'GARUDAFREE' && subtotal >= 500;
  const finalFee = isFreeDelivery || subtotal === 0 ? 0 : calculatedFee;
  const amountNeededForFreeDelivery = cleanCoupon === 'GARUDAFREE' ? Math.max(0, 500 - subtotal) : 0;

  return {
    ok: true,
    serviceable: true,
    pincode: cleanPin,
    locationName,
    distanceKm,
    ratePerKm,
    calculatedFee,
    finalFee,
    isFreeDelivery,
    freeShippingThreshold: 500,
    amountNeededForFreeDelivery,
  };
}

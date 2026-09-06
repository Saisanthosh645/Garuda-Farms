import { Router, Request, Response } from 'express';
import { calculateServerDeliveryFee, getDeliverySettingsFromDb, PINCODE_DISTANCE_MAP } from '../utils/distance';
import { getSupabase } from '../db/supabase';

const router = Router();

/**
 * POST /api/delivery/calculate
 * Dynamically calculates distance and delivery fee server-side for customer checkout.
 */
router.post('/calculate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode, subtotal = 0, couponCode } = req.body || {};

    if (!pincode) {
      res.status(400).json({
        ok: false,
        serviceable: false,
        error: 'PIN code is required to calculate delivery fee.',
      });
      return;
    }

    const numericSubtotal = Math.max(0, Number(subtotal) || 0);
    const result = await calculateServerDeliveryFee(String(pincode), numericSubtotal, couponCode);

    if (!result.ok || !result.serviceable) {
      res.status(200).json({
        ok: false,
        serviceable: false,
        pincode: result.pincode,
        error: result.error || 'Delivery is not available to this location.',
      });
      return;
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error('[Delivery Calculate Error]:', err);
    res.status(500).json({
      ok: false,
      serviceable: false,
      error: 'Failed to calculate delivery fee on server.',
    });
  }
});

/**
 * GET /api/delivery/pincodes
 * Returns all active, serviceable PIN codes for frontend autocomplete & check.
 */
router.get('/pincodes', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase();
    let pincodesList: Array<{ pincode: string; area_name: string; distance_km: number; is_enabled: boolean }> = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('serviceable_pincodes')
        .select('*')
        .eq('is_enabled', true)
        .order('pincode', { ascending: true });

      if (!error && data && data.length > 0) {
        pincodesList = data.map((item) => ({
          pincode: item.pincode,
          area_name: item.area_name,
          distance_km: Number(item.distance_km),
          is_enabled: Boolean(item.is_enabled),
        }));
      }
    }

    // Fallback to static mapping if DB empty or unavailable
    if (pincodesList.length === 0) {
      pincodesList = Object.entries(PINCODE_DISTANCE_MAP).map(([pin, info]) => ({
        pincode: pin,
        area_name: info.name,
        distance_km: info.distanceKm,
        is_enabled: true,
      }));
    }

    const settings = await getDeliverySettingsFromDb();

    res.status(200).json({
      ok: true,
      pincodes: pincodesList,
      ratePerKm: settings.ratePerKm,
      freeThreshold: settings.freeThreshold,
      originAddress: settings.originAddress,
    });
  } catch (err: any) {
    console.error('[Delivery Pincodes List Error]:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch serviceable PIN codes.' });
  }
});

export default router;

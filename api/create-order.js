const OFFERS = {
  starter: { name: 'Recovery Pack', baseAmount: 1.0 },
  accelerator: { name: 'Hyper Pack', baseAmount: 2.99 },
  rush: { name: 'Rank Surge Pack', baseAmount: 3.99 },
  sovereign: { name: 'Dominance Pack', baseAmount: 5.99 },
  nexus: { name: 'T4 Nexus Pack', baseAmount: 9.99 },
  throne: { name: 'Throne Protocol', baseAmount: 12.99 },
};
const ORDER_AMOUNT_DISPLAY_DECIMALS = 4;

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function buildExactAmount(baseAmount) {
  const safeBaseAmount = Number(baseAmount || 0).toFixed(2);
  const tail = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  return Number((Number(safeBaseAmount) + Number(`0.00${tail}`)).toFixed(ORDER_AMOUNT_DISPLAY_DECIMALS));
}

async function insertOrder(row) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed: ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const minerId = String(body.minerId || '').trim();
    const offerId = String(body.offerId || 'starter').trim();

    if (!minerId) {
      return Response.json(
        { ok: false, error: 'minerId is required' },
        { status: 400 }
      );
    }

    const offer = OFFERS[offerId];
    if (!offer) {
      return Response.json(
        { ok: false, error: 'invalid offerId' },
        { status: 400 }
      );
    }

    const orderId = `ORD_${crypto.randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase()}`;
    const exactAmount = buildExactAmount(offer.baseAmount);
    const expiresMinutes = Number(process.env.ORDER_EXPIRE_MINUTES || '15');
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000).toISOString();

    const saved = await insertOrder({
      order_id: orderId,
      miner_id: minerId,
      offer_id: offerId,
      offer_name: offer.name,
      base_amount: offer.baseAmount,
      exact_amount: exactAmount,
      status: 'pending',
      reward_granted: false,
      expires_at: expiresAt,
      meta: {
        source: 'vercel-api',
      },
    });

    return Response.json({
      ok: true,
      order: {
        orderId: saved.order_id,
        minerId: saved.miner_id,
        offerId: saved.offer_id,
        offerName: saved.offer_name,
        baseAmount: saved.base_amount,
        exactAmount: Number(saved.exact_amount).toFixed(ORDER_AMOUNT_DISPLAY_DECIMALS),
        payAddress: getEnv('TRON_RECEIVE_ADDRESS'),
        network: 'TRON (TRC20)',
        expiresAt: saved.expires_at,
        status: saved.status,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || 'create order failed',
      },
      { status: 500 }
    );
  }
}

export function GET() {
  return Response.json({
    ok: true,
    hint: 'Use POST /api/create-order',
    offers: OFFERS,
  });
}

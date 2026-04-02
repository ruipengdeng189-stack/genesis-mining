const OFFERS = {
  starter: { name: 'Starter Pack', baseAmount: 1.0 },
  boost: { name: 'Boost Pack', baseAmount: 3.0 },
  summit: { name: 'Summit Pack', baseAmount: 6.0 },
};

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function buildExactAmount(baseAmount) {
  const tail = String(Date.now() % 1000).padStart(3, '0');
  return Number((baseAmount + Number(`0.000${tail}`)).toFixed(6));
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

export async function GET() {
  try {
    const offer = OFFERS.starter;
    const orderId = `ORD_${crypto.randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase()}`;
    const exactAmount = buildExactAmount(offer.baseAmount);
    const expiresMinutes = Number(process.env.ORDER_EXPIRE_MINUTES || '15');
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000).toISOString();

    const saved = await insertOrder({
      order_id: orderId,
      miner_id: 'MINER_DEMO_001',
      offer_id: 'starter',
      offer_name: offer.name,
      base_amount: offer.baseAmount,
      exact_amount: exactAmount,
      status: 'pending',
      reward_granted: false,
      expires_at: expiresAt,
      meta: {
        source: 'vercel-test-api',
      },
    });

    return Response.json({
      ok: true,
      message: 'test order created successfully',
      order: {
        orderId: saved.order_id,
        minerId: saved.miner_id,
        offerId: saved.offer_id,
        offerName: saved.offer_name,
        baseAmount: saved.base_amount,
        exactAmount: Number(saved.exact_amount).toFixed(6),
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
        error: error.message || 'test order failed',
      },
      { status: 500 }
    );
  }
}

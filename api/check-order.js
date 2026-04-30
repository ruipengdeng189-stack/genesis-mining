const PAYMENT_NETWORK = 'TRON (TRC20)';
const DEFAULT_GAME_ID = 'default';

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizeGameId(value) {
  return String(value || '').trim().toLowerCase();
}

function resolveGameId(value) {
  return normalizeGameId(value) || DEFAULT_GAME_ID;
}

function getOrderGameId(order) {
  const meta = order?.meta && typeof order.meta === 'object' ? order.meta : {};
  return resolveGameId(meta.gameId || order?.game_id || order?.gameId);
}

function buildOrderResponse(order) {
  return {
    orderId: order.order_id,
    minerId: order.miner_id,
    offerId: order.offer_id,
    offerName: order.offer_name,
    gameId: getOrderGameId(order),
    baseAmount: order.base_amount,
    exactAmount: Number(order.exact_amount).toFixed(4),
    payAddress: getEnv('TRON_RECEIVE_ADDRESS'),
    network: PAYMENT_NETWORK,
    status: order.status,
    txid: order.txid,
    rewardGranted: Boolean(order.reward_granted),
    createdAt: order.created_at,
    expiresAt: order.expires_at,
    paidAt: order.paid_at,
  };
}

async function getOrder(orderId) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const url = new URL(`${supabaseUrl}/rest/v1/orders`);
  url.searchParams.set('order_id', `eq.${orderId}`);
  url.searchParams.set(
    'select',
    'order_id,miner_id,offer_id,offer_name,base_amount,exact_amount,status,txid,reward_granted,created_at,expires_at,paid_at,meta'
  );

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase query failed: ${errorText}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

async function markExpired(orderId) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status: 'expired' }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Expire order failed: ${errorText}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = String(searchParams.get('orderId') || '').trim();
    const minerId = String(searchParams.get('minerId') || '').trim();

    if (!orderId) {
      return Response.json(
        { ok: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!minerId) {
      return Response.json(
        { ok: false, error: 'minerId is required' },
        { status: 400 }
      );
    }

    let order = await getOrder(orderId);

    if (!order) {
      return Response.json(
        { ok: false, error: 'order not found' },
        { status: 404 }
      );
    }

    if (String(order.miner_id || '').trim() !== minerId) {
      return Response.json(
        { ok: false, error: 'minerId does not match order' },
        { status: 403 }
      );
    }

    if (
      order.status === 'pending' &&
      order.expires_at &&
      new Date(order.expires_at).getTime() < Date.now()
    ) {
      order = (await markExpired(orderId)) || { ...order, status: 'expired' };
    }

    return Response.json({
      ok: true,
      order: buildOrderResponse(order),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || 'check order failed',
      },
      { status: 500 }
    );
  }
}

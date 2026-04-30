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
    paidAt: order.paid_at,
    rewardGranted: Boolean(order.reward_granted),
    createdAt: order.created_at,
    expiresAt: order.expires_at,
  };
}

function normalizeTxid(txid) {
  const value = String(txid || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error('txid format is invalid, it must be 64 hex chars');
  }
  return value;
}

async function supabaseRequest(url, init) {
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed: ${errorText}`);
  }

  return response.json();
}

async function getOrder(orderId) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const url = new URL(`${supabaseUrl}/rest/v1/orders`);
  url.searchParams.set('order_id', `eq.${orderId}`);
  url.searchParams.set(
    'select',
    'order_id,miner_id,offer_id,offer_name,base_amount,exact_amount,status,txid,reward_granted,created_at,paid_at,expires_at,meta'
  );

  const rows = await supabaseRequest(url.toString(), { method: 'GET' });
  return rows[0] || null;
}

async function updateOrder(orderId, payload) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const url = `${supabaseUrl}/rest/v1/orders?order_id=eq.${orderId}`;

  const rows = await supabaseRequest(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  return rows[0] || null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = String(body.orderId || '').trim();
    const minerId = String(body.minerId || '').trim();
    const txid = normalizeTxid(body.txid || '');

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

    const order = await getOrder(orderId);
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

    if (order.txid && String(order.txid).toLowerCase() !== txid) {
      return Response.json(
        { ok: false, error: 'order has already been bound to another txid' },
        { status: 409 }
      );
    }

    if (order.reward_granted) {
      return Response.json({
        ok: true,
        message: 'reward already marked as granted',
        order: buildOrderResponse({ ...order, reward_granted: true }),
      });
    }

    if (order.status !== 'paid' && order.status !== 'granted') {
      return Response.json(
        { ok: false, error: 'order is not paid yet' },
        { status: 400 }
      );
    }

    const updatedOrder = await updateOrder(orderId, {
      status: 'granted',
      txid,
      reward_granted: true,
    });

    return Response.json({
      ok: true,
      message: 'reward marked as granted',
      order: buildOrderResponse(updatedOrder),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || 'claim payment failed',
      },
      { status: 500 }
    );
  }
}

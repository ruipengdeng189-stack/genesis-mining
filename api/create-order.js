const OFFER_CATALOGS = {
  default: {
    starter: { name: 'Recovery Pack', baseAmount: 1.0 },
    accelerator: { name: 'Hyper Pack', baseAmount: 2.99 },
    rush: { name: 'Rank Surge Pack', baseAmount: 3.99 },
    sovereign: { name: 'Dominance Pack', baseAmount: 5.99 },
    nexus: { name: 'T4 Nexus Pack', baseAmount: 9.99 },
    throne: { name: 'Throne Protocol', baseAmount: 12.99 },
  },
  'drone-squad': {
    starter: { name: 'Starter Flight Pack', baseAmount: 6.0 },
    accelerator: { name: 'Accelerator Pack', baseAmount: 15.0 },
    rush: { name: 'Rush Break Pack', baseAmount: 30.0 },
    sovereign: { name: 'Sovereign Arsenal Pack', baseAmount: 68.0 },
    nexus: { name: 'Nexus Fleet Pack', baseAmount: 128.0 },
  },
  'cipher-match': {
    starterPack: { name: 'Starter Decode Pack', baseAmount: 6.0 },
    seasonPass: { name: 'Season Pass', baseAmount: 18.0 },
    breakerVault: { name: 'Breaker Vault', baseAmount: 68.0 },
  },
  'neon-cards': {
    starter: { name: 'Starter Deck Pack', baseAmount: 6.0 },
    tactical: { name: 'Tactical Supply Pack', baseAmount: 15.0 },
    captain: { name: 'Captain Growth Pack', baseAmount: 30.0 },
    champion: { name: 'Champion Deck Pack', baseAmount: 68.0 },
  },
  'orbital-fall': {
    starter: { name: 'Starter Launch Pack', baseAmount: 6.0 },
    accelerator: { name: 'Accelerator Supply Pack', baseAmount: 15.0 },
    rush: { name: 'Rush Break Pack', baseAmount: 30.0 },
    sovereign: { name: 'Sovereign Arsenal Pack', baseAmount: 68.0 },
    nexus: { name: 'Nexus Matrix Pack', baseAmount: 128.0 },
  },
};

const ORDER_AMOUNT_DISPLAY_DECIMALS = 4;
const ORDER_LOOKUP_LIMIT = 48;
const UNIQUE_AMOUNT_MAX_ATTEMPTS = 99;
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

function resolveOfferCatalog(gameId) {
  return OFFER_CATALOGS[gameId] || OFFER_CATALOGS.default;
}

function formatExactAmount(value) {
  return Number(Number(value || 0).toFixed(ORDER_AMOUNT_DISPLAY_DECIMALS));
}

function shuffle(list) {
  const next = list.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }
  return next;
}

function buildExactAmount(baseAmount, tailValue = null) {
  const safeBaseAmount = Number(baseAmount || 0).toFixed(2);
  const tail = String(tailValue ?? (Math.floor(Math.random() * 99) + 1)).padStart(2, '0');
  return formatExactAmount(Number(safeBaseAmount) + Number(`0.00${tail}`));
}

function getOrderGameId(order) {
  const meta = order?.meta && typeof order.meta === 'object' ? order.meta : {};
  return resolveGameId(meta.gameId || order?.game_id || order?.gameId);
}

function isOrderExpired(order, now = Date.now()) {
  if (!order?.expires_at) return true;
  return new Date(order.expires_at).getTime() < now;
}

function buildOrderResponse(order, { reused = false, gameId = '' } = {}) {
  const resolvedGameId = resolveGameId(gameId || getOrderGameId(order));
  return {
    orderId: order.order_id,
    minerId: order.miner_id,
    offerId: order.offer_id,
    offerName: order.offer_name,
    gameId: resolvedGameId,
    baseAmount: order.base_amount,
    exactAmount: Number(order.exact_amount).toFixed(ORDER_AMOUNT_DISPLAY_DECIMALS),
    payAddress: getEnv('TRON_RECEIVE_ADDRESS'),
    network: PAYMENT_NETWORK,
    createdAt: order.created_at,
    expiresAt: order.expires_at,
    paidAt: order.paid_at,
    status: order.status,
    rewardGranted: Boolean(order.reward_granted),
    reused,
  };
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

async function insertOrder(row) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const data = await supabaseRequest(`${supabaseUrl}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  return Array.isArray(data) ? data[0] : data;
}

async function listOrdersByMiner(minerId) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const url = new URL(`${supabaseUrl}/rest/v1/orders`);
  url.searchParams.set('miner_id', `eq.${minerId}`);
  url.searchParams.set(
    'select',
    'order_id,miner_id,offer_id,offer_name,base_amount,exact_amount,status,txid,reward_granted,created_at,expires_at,paid_at,meta'
  );
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', String(ORDER_LOOKUP_LIMIT));
  return supabaseRequest(url.toString(), { method: 'GET' });
}

async function listOrdersByExactAmount(exactAmount) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const url = new URL(`${supabaseUrl}/rest/v1/orders`);
  url.searchParams.set('exact_amount', `eq.${formatExactAmount(exactAmount)}`);
  url.searchParams.set('status', 'eq.pending');
  url.searchParams.set('select', 'order_id,exact_amount,status,created_at,expires_at,meta');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '16');
  return supabaseRequest(url.toString(), { method: 'GET' });
}

async function markOrderExpired(orderId) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const rows = await supabaseRequest(`${supabaseUrl}/rest/v1/orders?order_id=eq.${orderId}&status=eq.pending`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status: 'expired' }),
  });
  return rows[0] || null;
}

async function getOrderBucketsByMinerGame(minerId, gameId) {
  const orders = await listOrdersByMiner(minerId);
  const activeOrders = [];
  const paidOrders = [];
  const grantedOrders = [];

  for (const order of orders) {
    if (getOrderGameId(order) !== gameId) continue;

    if (order.status === 'pending') {
      if (isOrderExpired(order)) {
        await markOrderExpired(order.order_id);
        continue;
      }
      activeOrders.push(order);
      continue;
    }

    if (order.status === 'paid' && !order.reward_granted) {
      paidOrders.push(order);
      continue;
    }

    if (order.status === 'granted' || order.reward_granted) {
      grantedOrders.push(order);
    }
  }

  return {
    pendingOrders: activeOrders,
    paidOrders,
    grantedOrders,
  };
}

async function isExactAmountInUse(exactAmount) {
  const rows = await listOrdersByExactAmount(exactAmount);

  for (const order of rows) {
    if (isOrderExpired(order)) {
      await markOrderExpired(order.order_id);
      continue;
    }
    return true;
  }

  return false;
}

async function buildUniqueExactAmount(baseAmount) {
  const tails = shuffle(Array.from({ length: 99 }, (_, index) => index + 1)).slice(0, UNIQUE_AMOUNT_MAX_ATTEMPTS);

  for (const tail of tails) {
    const candidate = buildExactAmount(baseAmount, tail);
    if (!(await isExactAmountInUse(candidate))) {
      return candidate;
    }
  }

  throw new Error('No exact payment slot is available right now, please retry in one minute');
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const minerId = String(body.minerId || '').trim();
    const offerId = String(body.offerId || 'starter').trim();
    const gameId = normalizeGameId(body.gameId);

    if (!minerId) {
      return Response.json(
        { ok: false, error: 'minerId is required' },
        { status: 400 }
      );
    }

    const offerCatalog = resolveOfferCatalog(gameId);
    const offer = offerCatalog[offerId];
    if (!offer) {
      return Response.json(
        { ok: false, error: 'invalid offerId' },
        { status: 400 }
      );
    }

    const orderId = `ORD_${crypto.randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase()}`;
    const expiresMinutes = Number(process.env.ORDER_EXPIRE_MINUTES || '15');
    const resolvedGameId = resolveGameId(gameId);
    const orderBuckets = await getOrderBucketsByMinerGame(minerId, resolvedGameId);
    const sameOfferGrantedOrder = orderBuckets.grantedOrders.find((item) => String(item.offer_id || '') === offerId);

    if (sameOfferGrantedOrder) {
      return Response.json(
        {
          ok: false,
          code: 'OFFER_ALREADY_OWNED',
          error: 'This pack is already active on this miner.',
          order: buildOrderResponse(sameOfferGrantedOrder, { reused: true, gameId: resolvedGameId }),
        },
        { status: 409 }
      );
    }

    const sameOfferPaidOrder = orderBuckets.paidOrders.find((item) => String(item.offer_id || '') === offerId);
    if (sameOfferPaidOrder) {
      return Response.json({
        ok: true,
        reused: true,
        order: buildOrderResponse(sameOfferPaidOrder, { reused: true, gameId: resolvedGameId }),
      });
    }

    const sameOfferPendingOrder = orderBuckets.pendingOrders.find((item) => String(item.offer_id || '') === offerId);

    if (sameOfferPendingOrder) {
      return Response.json({
        ok: true,
        reused: true,
        order: buildOrderResponse(sameOfferPendingOrder, { reused: true, gameId: resolvedGameId }),
      });
    }

    if (orderBuckets.paidOrders.length > 0) {
      return Response.json(
        {
          ok: false,
          code: 'CLAIM_REQUIRED',
          error: 'You already have a verified order waiting for reward claim. Finish that recovery first.',
          order: buildOrderResponse(orderBuckets.paidOrders[0], { reused: true, gameId: resolvedGameId }),
        },
        { status: 409 }
      );
    }

    if (orderBuckets.pendingOrders.length > 0) {
      return Response.json(
        {
          ok: false,
          code: 'PENDING_ORDER_EXISTS',
          error: 'You already have a pending order. Finish it or wait for it to expire before creating another one.',
          order: buildOrderResponse(orderBuckets.pendingOrders[0], { reused: true, gameId: resolvedGameId }),
        },
        { status: 409 }
      );
    }

    const exactAmount = await buildUniqueExactAmount(offer.baseAmount);
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
        gameId: resolvedGameId,
      },
    });

    return Response.json({
      ok: true,
      reused: false,
      order: buildOrderResponse(saved, { reused: false, gameId: resolvedGameId }),
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
    offers: OFFER_CATALOGS.default,
    catalogs: Object.keys(OFFER_CATALOGS),
  });
}

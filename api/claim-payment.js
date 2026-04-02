function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
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
    'order_id,offer_id,offer_name,status,txid,reward_granted,paid_at,expires_at'
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
    const txid = normalizeTxid(body.txid || '');

    if (!orderId) {
      return Response.json(
        { ok: false, error: 'orderId is required' },
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
        order: {
          orderId: order.order_id,
          offerId: order.offer_id,
          offerName: order.offer_name,
          status: order.status,
          txid: order.txid,
          paidAt: order.paid_at,
          rewardGranted: true,
        },
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
      order: {
        orderId: updatedOrder.order_id,
        offerId: updatedOrder.offer_id,
        offerName: updatedOrder.offer_name,
        status: updatedOrder.status,
        txid: updatedOrder.txid,
        paidAt: updatedOrder.paid_at,
        rewardGranted: updatedOrder.reward_granted,
      },
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

const TRON_API_BASE = 'https://api.trongrid.io';
const TRANSFER_SELECTOR = 'a9059cbb';
const USDT_DECIMALS = 6;
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizeTxid(txid) {
  const value = String(txid || '').trim();
  if (!/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error('txid format is invalid, it must be 64 hex chars');
  }
  return value.toLowerCase();
}

function decimalToBaseUnits(amount, decimals = USDT_DECIMALS) {
  const text = String(amount).trim();
  if (!/^\d+(\.\d+)?$/.test(text)) {
    throw new Error(`Invalid decimal amount: ${text}`);
  }

  const [whole, fraction = ''] = text.split('.');
  const paddedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  const normalized = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  return BigInt(normalized || '0');
}

function base58ToHex(address) {
  const input = String(address || '').trim();
  if (!input) {
    throw new Error('Address is empty');
  }

  let bytes = [0];

  for (const char of input) {
    const charIndex = BASE58_ALPHABET.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Invalid Base58 character: ${char}`);
    }

    let carry = charIndex;
    for (let index = 0; index < bytes.length; index += 1) {
      carry += bytes[index] * 58;
      bytes[index] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (let index = 0; index < input.length && input[index] === '1'; index += 1) {
    bytes.push(0);
  }

  const decoded = Uint8Array.from(bytes.reverse());
  if (decoded.length < 25) {
    throw new Error('Invalid TRON Base58 address length');
  }

  const payload = decoded.slice(0, decoded.length - 4);
  return Array.from(payload)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function decodeTransferData(dataHex) {
  const clean = String(dataHex || '').replace(/^0x/, '').toLowerCase();

  if (!clean.startsWith(TRANSFER_SELECTOR)) {
    throw new Error('Transaction is not transfer(address,uint256)');
  }

  if (clean.length < 8 + 64 + 64) {
    throw new Error('Transaction data is too short to decode');
  }

  const addressSlot = clean.slice(8, 72);
  const amountSlot = clean.slice(72, 136);

  const recipientHex = `41${addressSlot.slice(24)}`.toUpperCase();
  const amountBaseUnits = BigInt(`0x${amountSlot}`);

  return {
    recipientHex,
    amountBaseUnits,
  };
}

async function tronPost(path, body) {
  const response = await fetch(`${TRON_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TRON-PRO-API-KEY': getEnv('TRONGRID_API_KEY'),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TRON API failed: ${errorText}`);
  }

  return response.json();
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
    'order_id,miner_id,offer_id,offer_name,base_amount,exact_amount,status,txid,reward_granted,created_at,expires_at,paid_at'
  );

  const rows = await supabaseRequest(url.toString(), { method: 'GET' });
  return rows[0] || null;
}

async function getOrderByTxid(txid) {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const url = new URL(`${supabaseUrl}/rest/v1/orders`);
  url.searchParams.set('txid', `eq.${txid}`);
  url.searchParams.set('select', 'order_id,status,txid');

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

function isTransactionSuccessful(txInfo, txRaw) {
  const receiptResult = txInfo?.receipt?.result;
  if (receiptResult && receiptResult !== 'SUCCESS') {
    return false;
  }

  const contractRet = txRaw?.ret?.[0]?.contractRet;
  if (contractRet && contractRet !== 'SUCCESS') {
    return false;
  }

  return true;
}

function getRawTransferPayload(txRaw) {
  const contract = txRaw?.raw_data?.contract?.[0];
  const value = contract?.parameter?.value || {};

  return {
    contractType: contract?.type,
    contractAddressHex: String(value.contract_address || '').toUpperCase(),
    data: String(value.data || ''),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = String(searchParams.get('orderId') || '').trim();
    const txid = normalizeTxid(searchParams.get('txid') || '');

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

    if (order.status === 'cancelled') {
      return Response.json(
        { ok: false, error: 'order is cancelled' },
        { status: 400 }
      );
    }

    if ((order.status === 'paid' || order.status === 'granted') && order.txid === txid) {
      return Response.json({
        ok: true,
        message: 'payment already verified for this order',
        order: {
          orderId: order.order_id,
          status: order.status,
          txid: order.txid,
          paidAt: order.paid_at,
          rewardGranted: order.reward_granted,
        },
      });
    }

    if ((order.status === 'paid' || order.status === 'granted') && order.txid && order.txid !== txid) {
      return Response.json(
        { ok: false, error: 'order has already been bound to another txid' },
        { status: 409 }
      );
    }

    const existingTxidOrder = await getOrderByTxid(txid);
    if (existingTxidOrder && existingTxidOrder.order_id !== order.order_id) {
      return Response.json(
        { ok: false, error: 'this txid has already been used by another order' },
        { status: 409 }
      );
    }

    const txRaw = await tronPost('/wallet/gettransactionbyid', { value: txid });
    if (!txRaw || !txRaw.raw_data) {
      return Response.json(
        { ok: false, error: 'txid not found on TRON mainnet' },
        { status: 404 }
      );
    }

    const txInfo = await tronPost('/walletsolidity/gettransactioninfobyid', { value: txid });
    if (!txInfo || !txInfo.id) {
      return Response.json(
        { ok: false, error: 'transaction is not confirmed yet' },
        { status: 400 }
      );
    }

    if (!isTransactionSuccessful(txInfo, txRaw)) {
      return Response.json(
        { ok: false, error: 'transaction execution failed on chain' },
        { status: 400 }
      );
    }

    const rawPayload = getRawTransferPayload(txRaw);
    if (rawPayload.contractType !== 'TriggerSmartContract') {
      return Response.json(
        { ok: false, error: 'transaction is not a TRC20 contract transfer' },
        { status: 400 }
      );
    }

    const expectedContractHex = base58ToHex(getEnv('USDT_TRC20_CONTRACT'));
    if (rawPayload.contractAddressHex !== expectedContractHex) {
      return Response.json(
        { ok: false, error: 'transaction contract is not TRC20 USDT' },
        { status: 400 }
      );
    }

    const decodedTransfer = decodeTransferData(rawPayload.data);
    const expectedReceiveAddressHex = base58ToHex(getEnv('TRON_RECEIVE_ADDRESS'));
    if (decodedTransfer.recipientHex !== expectedReceiveAddressHex) {
      return Response.json(
        { ok: false, error: 'recipient address does not match your payment address' },
        { status: 400 }
      );
    }

    const expectedAmountBaseUnits = decimalToBaseUnits(order.exact_amount, USDT_DECIMALS);
    if (decodedTransfer.amountBaseUnits !== expectedAmountBaseUnits) {
      return Response.json(
        {
          ok: false,
          error: `amount mismatch, expected ${order.exact_amount} USDT`,
        },
        { status: 400 }
      );
    }

    const txTimeMs = Number(txInfo.blockTimeStamp || 0);
    if (!txTimeMs) {
      return Response.json(
        { ok: false, error: 'unable to read confirmed block timestamp' },
        { status: 400 }
      );
    }

    const createdAtMs = new Date(order.created_at).getTime();
    const expiresAtMs = new Date(order.expires_at).getTime();

    if (txTimeMs < createdAtMs) {
      return Response.json(
        { ok: false, error: 'payment happened before this order was created' },
        { status: 400 }
      );
    }

    if (txTimeMs > expiresAtMs) {
      return Response.json(
        { ok: false, error: 'payment happened after the order expired' },
        { status: 400 }
      );
    }

    const paidAtIso = new Date(txTimeMs).toISOString();

    const updatedOrder = await updateOrder(order.order_id, {
      status: 'paid',
      txid,
      paid_at: paidAtIso,
    });

    return Response.json({
      ok: true,
      message: 'payment verified successfully',
      order: {
        orderId: updatedOrder.order_id,
        minerId: updatedOrder.miner_id,
        offerId: updatedOrder.offer_id,
        offerName: updatedOrder.offer_name,
        exactAmount: Number(updatedOrder.exact_amount).toFixed(4),
        status: updatedOrder.status,
        txid: updatedOrder.txid,
        paidAt: updatedOrder.paid_at,
        rewardGranted: updatedOrder.reward_granted,
      },
      note: '当前这一步只把订单标记为 paid。下一步我们再把前端游戏奖励接上。',
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || 'verify payment failed',
      },
      { status: 500 }
    );
  }
}

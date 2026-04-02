export function GET() {
  return Response.json({
    ok: true,
    service: 'genesis-payment-api',
    now: new Date().toISOString(),
  });
}

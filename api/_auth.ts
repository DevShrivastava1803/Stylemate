// Minimal ID token decoder (no signature verification). Replace with proper verification in production.
export function getUserFromAuthHeader(req: any): { userId: string; email?: string } | null {
  const auth = req.headers?.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    const payload = JSON.parse(json);
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
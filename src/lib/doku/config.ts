export interface DokuConfig {
  clientId: string;
  secretKey: string;
  env: 'sandbox' | 'production';
  baseUrl: string;
}

export function getDokuConfig(): DokuConfig {
  const clientId = process.env.DOKU_CLIENT_ID?.trim() || '';
  const secretKey = process.env.DOKU_SECRET_KEY?.trim() || '';
  const env = (process.env.DOKU_ENV?.toLowerCase() === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production';

  if (!clientId || !secretKey) {
    throw new Error('DOKU API credentials (DOKU_CLIENT_ID or DOKU_SECRET_KEY) are not configured');
  }

  const baseUrl = env === 'production' 
    ? 'https://api.doku.com' 
    : 'https://api-sandbox.doku.com';

  return {
    clientId,
    secretKey,
    env,
    baseUrl,
  };
}

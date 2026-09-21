import crypto from 'crypto';

/**
 * Generate SHA-256 Base64 Digest of the JSON request/response body.
 */
export function generateDigest(body: string): string {
  return crypto.createHash('sha256').update(body, 'utf-8').digest('base64');
}

/**
 * Generate DOKU Non-SNAP Signature header value.
 * Format: HMACSHA256=<base64-encoded-hmac>
 */
export function generateSignature(params: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  digest?: string;
  secretKey: string;
}): string {
  const { clientId, requestId, requestTimestamp, requestTarget, digest, secretKey } = params;

  let component = `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}`;

  if (digest && digest.trim().length > 0) {
    component += `\nDigest:${digest}`;
  }

  const hmac = crypto.createHmac('sha256', secretKey)
    .update(component, 'utf-8')
    .digest('base64');

  return `HMACSHA256=${hmac}`;
}

/**
 * Generate standard ISO 8601 UTC+0 timestamp formatted as YYYY-MM-DDTHH:mm:ssZ
 */
export function getDokuTimestamp(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19) + 'Z';
}

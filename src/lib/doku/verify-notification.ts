import crypto from 'crypto';
import { generateDigest, generateSignature } from './signature';
import { getDokuConfig } from './config';

export interface VerifyNotificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Verifies an incoming DOKU HTTP Notification webhook request.
 *
 * @param headers - HTTP Request Headers (from NextRequest or web standard Headers)
 * @param rawBody - Raw string content of the request body
 * @param requestPath - Target path of the webhook endpoint (default: '/api/webhooks/doku')
 */
export function verifyDokuNotification(
  headers: Headers,
  rawBody: string,
  requestPath: string = '/api/webhooks/doku'
): VerifyNotificationResult {
  try {
    const config = getDokuConfig();

    const clientId = headers.get('client-id') || headers.get('Client-Id');
    const requestId = headers.get('request-id') || headers.get('Request-Id');
    const requestTimestamp = headers.get('request-timestamp') || headers.get('Request-Timestamp');
    const incomingSignature = headers.get('signature') || headers.get('Signature');

    if (!clientId || !requestId || !requestTimestamp || !incomingSignature) {
      return {
        isValid: false,
        error: 'Missing required DOKU notification security headers (Client-Id, Request-Id, Request-Timestamp, or Signature)',
      };
    }

    // Verify Client-Id matches our configured Client-Id
    if (clientId.trim() !== config.clientId.trim()) {
      return {
        isValid: false,
        error: 'Client-Id in notification header does not match configured DOKU_CLIENT_ID',
      };
    }

    // Compute Digest from raw body
    const digest = generateDigest(rawBody);

    // Compute expected signature
    const expectedSignature = generateSignature({
      clientId,
      requestId,
      requestTimestamp,
      requestTarget: requestPath,
      digest,
      secretKey: config.secretKey,
    });

    // Timing-safe comparison
    const incomingSigBuffer = Buffer.from(incomingSignature.trim());
    const expectedSigBuffer = Buffer.from(expectedSignature.trim());

    if (incomingSigBuffer.length !== expectedSigBuffer.length) {
      return {
        isValid: false,
        error: 'Signature length mismatch',
      };
    }

    const match = crypto.timingSafeEqual(incomingSigBuffer, expectedSigBuffer);

    if (!match) {
      return {
        isValid: false,
        error: 'Signature verification failed',
      };
    }

    return { isValid: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown verification error';
    return {
      isValid: false,
      error: message,
    };
  }
}

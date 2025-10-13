import crypto from 'crypto';

export function hashEmail(email: string): string {
  return crypto.createHash('md5').update(email).digest('hex');
}

import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual, createCipheriv, createDecipheriv } from 'crypto';

const DEFAULT_SECRET = 'oortapi-default-secret-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
const TOKEN_NAME = 'oortapi_token';

function assertSecretValid() {
  if (process.env.NODE_ENV === 'production' && JWT_SECRET === DEFAULT_SECRET) {
    throw new Error('FATAL: JWT_SECRET must be set in production. Define a strong JWT_SECRET environment variable.');
  }
}

// --- JWT helpers ---

function base64url(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
  exp: number;
}

export function signToken(payload: Omit<JWTPayload, 'exp'>): string {
  assertSecretValid();
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ ...payload, exp: now + JWT_EXPIRY }));
  const signature = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;

    const payload: JWTPayload = JSON.parse(base64urlDecode(body));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export { TOKEN_NAME };

// --- Password hashing (PBKDF2) ---

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
}

export function generateSalt(): string {
  return randomBytes(32).toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

// --- Cookie helper for API routes ---

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${TOKEN_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setTokenCookie(token: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const isHttps = siteUrl.startsWith('https://') || process.env.COOKIE_SECURE === 'true';
  const secure = isHttps ? '; Secure' : '';
  return `${TOKEN_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${JWT_EXPIRY}`;
}

export function clearTokenCookie(): string {
  return `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// --- Session Management ---

const MAX_SESSIONS_PER_USER = 10;

export function createSession(userId: number, token: string, ip?: string, userAgent?: string) {
  // Lazy import to avoid circular dependency
  const db = require('./db').default;

  // Clean up expired sessions (older than JWT expiry)
  db.prepare("DELETE FROM sessions WHERE created_at < datetime('now', '-7 days')").run();

  // Enforce max sessions per user
  const sessions = db.prepare('SELECT id FROM sessions WHERE user_id = ? ORDER BY last_active_at DESC').all(userId) as { id: number }[];
  if (sessions.length >= MAX_SESSIONS_PER_USER) {
    // Remove oldest sessions
    const toRemove = sessions.slice(MAX_SESSIONS_PER_USER - 1);
    for (const s of toRemove) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(s.id);
    }
  }

  // Hash the token for storage (don't store raw JWT)
  const { createHash } = require('crypto');
  const tokenHash = createHash('sha256').update(token).digest('hex');

  db.prepare(
    'INSERT INTO sessions (user_id, token_hash, ip_address, user_agent) VALUES (?, ?, ?, ?)'
  ).run(userId, tokenHash, ip || null, userAgent || null);
}

export function deleteSession(token: string) {
  const db = require('./db').default;
  const { createHash } = require('crypto');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function getUserSessions(userId: number): { id: number; ip_address: string | null; user_agent: string | null; created_at: string; last_active_at: string }[] {
  const db = require('./db').default;
  return db.prepare('SELECT id, ip_address, user_agent, created_at, last_active_at FROM sessions WHERE user_id = ? ORDER BY last_active_at DESC').all(userId);
}

// --- Generate API Key ---

export function generateApiKey(): string {
  const random = randomBytes(32).toString('hex');
  return `sk-oort-${random}`;
}

export function hashApiKey(key: string): string {
  return createHmac('sha256', key).digest('hex');
}

// --- AES-256-GCM Encryption for channel API keys ---

const DEFAULT_ENCRYPTION_KEY = 'oortapi-default-encryption-key-32b!';

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY;
  if (process.env.NODE_ENV === 'production' && key === DEFAULT_ENCRYPTION_KEY) {
    throw new Error('FATAL: ENCRYPTION_KEY must be set in production. Define a strong 32-byte ENCRYPTION_KEY environment variable.');
  }
  // Derive a 32-byte key from whatever is provided
  return pbkdf2Sync(key, 'oortapi-salt', 10000, 32, 'sha256');
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(ciphertext: string): string {
  // Support legacy plaintext keys (no colons = not encrypted)
  if (!ciphertext.includes(':')) return ciphertext;

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted key format');
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = Buffer.from(parts[2], 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
  } catch {
    throw new Error('Failed to decrypt channel API key — check ENCRYPTION_KEY');
  }
}

const CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 10;

/** The invite link is `<base>/entrar/<code>`, so the code is what follows it. */
export const INVITE_PATH = "entrar/";

/** Accepts a bare code or a whole invite URL somebody pasted. */
export function extractInviteCode(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const position = trimmed.lastIndexOf(INVITE_PATH);
  const tail = position === -1 ? trimmed : trimmed.slice(position + INVITE_PATH.length);
  const code = tail.split(/[/?#]/)[0];
  return CODE_PATTERN.test(code) ? code : null;
}

/** Mind the base path: on GitHub Pages the app lives under /<repo>/. */
export function buildInviteUrl(origin: string, base: string, code: string): string {
  const path = base.endsWith("/") ? base : `${base}/`;
  return `${origin}${path}${INVITE_PATH}${code}`;
}

/** Local mode has no server to hand out codes, so the browser draws one. */
export function generateInviteCode(randomBytes: (size: number) => Uint8Array = browserRandomBytes): string {
  return Array.from(randomBytes(CODE_LENGTH), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function browserRandomBytes(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

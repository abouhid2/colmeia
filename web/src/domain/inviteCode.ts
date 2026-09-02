const CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
/** Lowercase only: the code gets read off somebody else's screen and typed by
 *  hand, and "l" against "I" is a fight nobody wins. The extra characters make
 *  up for the smaller alphabet. */
const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH = 12;
/** Bytes above the last whole run of the alphabet would make their letters
 *  likelier than the rest, so they are drawn again instead. */
const UNBIASED_CEILING = 256 - (256 % CODE_ALPHABET.length);

/** The invite link is `<base>/entrar/<code>`, so the code is what follows it. */
export const INVITE_PATH = "entrar/";

/** Accepts a bare code or a whole invite URL somebody pasted. Case is not part
 *  of the code: whoever types it has no way of knowing which one was meant. */
export function extractInviteCode(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const position = trimmed.lastIndexOf(INVITE_PATH);
  const tail = position === -1 ? trimmed : trimmed.slice(position + INVITE_PATH.length);
  const code = tail.split(/[/?#]/)[0];
  return CODE_PATTERN.test(code) ? code.toLowerCase() : null;
}

/** Mind the base path: on GitHub Pages the app lives under /<repo>/. */
export function buildInviteUrl(origin: string, base: string, code: string): string {
  const path = base.endsWith("/") ? base : `${base}/`;
  return `${origin}${path}${INVITE_PATH}${code}`;
}

/** Local mode has no server to hand out codes, so the browser draws one. */
export function generateInviteCode(randomBytes: (size: number) => Uint8Array = browserRandomBytes): string {
  const code: string[] = [];
  while (code.length < CODE_LENGTH) {
    for (const byte of randomBytes(CODE_LENGTH - code.length)) {
      if (byte < UNBIASED_CEILING) code.push(CODE_ALPHABET[byte % CODE_ALPHABET.length]);
    }
  }
  return code.join("");
}

function browserRandomBytes(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

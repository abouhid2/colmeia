import { describe, expect, it } from "vitest";
import { buildInviteUrl, extractInviteCode, generateInviteCode } from "./inviteCode";

describe("extractInviteCode", () => {
  it("takes a bare code as it is, minus the case nobody can see", () => {
    expect(extractInviteCode("aB3xY9")).toBe("ab3xy9");
    expect(extractInviteCode("  demo  ")).toBe("demo");
  });

  it("pulls the code out of a pasted link", () => {
    expect(extractInviteCode("https://casa.exemplo/entrar/ab3xy9")).toBe("ab3xy9");
    expect(extractInviteCode("https://user.github.io/colmeia/entrar/ab3xy9")).toBe("ab3xy9");
    expect(extractInviteCode("https://casa.exemplo/entrar/ab3xy9/")).toBe("ab3xy9");
    expect(extractInviteCode("https://casa.exemplo/entrar/ab3xy9?de=zap#topo")).toBe("ab3xy9");
    expect(extractInviteCode("https://casa.exemplo/entrar/AB3XY9")).toBe("ab3xy9");
  });

  it("refuses anything that is not a code", () => {
    expect(extractInviteCode("")).toBeNull();
    expect(extractInviteCode("   ")).toBeNull();
    expect(extractInviteCode("https://casa.exemplo/entrar/")).toBeNull();
    expect(extractInviteCode("https://casa.exemplo/tarefas")).toBeNull();
    expect(extractInviteCode("código com espaço")).toBeNull();
  });
});

describe("buildInviteUrl", () => {
  it("respects the base path the app is served from", () => {
    expect(buildInviteUrl("https://casa.exemplo", "/", "aB3")).toBe("https://casa.exemplo/entrar/aB3");
    expect(buildInviteUrl("https://user.github.io", "/colmeia/", "aB3")).toBe("https://user.github.io/colmeia/entrar/aB3");
    expect(buildInviteUrl("https://user.github.io", "/colmeia", "aB3")).toBe("https://user.github.io/colmeia/entrar/aB3");
  });

  it("round-trips with the extractor", () => {
    const url = buildInviteUrl("https://user.github.io", "/colmeia/", "ab3xy9");
    expect(extractInviteCode(url)).toBe("ab3xy9");
  });
});

describe("generateInviteCode", () => {
  it("draws a code out of the lowercase alphabet only", () => {
    const code = generateInviteCode((size) => Uint8Array.from({ length: size }, (_, index) => index));

    expect(code).toBe("abcdefghijkl");
    expect(extractInviteCode(code)).toBe(code);
  });

  it("uses nothing but its own alphabet, whatever the bytes are", () => {
    let seed = 0;
    const code = generateInviteCode((size) => Uint8Array.from({ length: size }, () => (seed += 251) % 256));

    expect(code).toMatch(/^[a-z0-9]{12}$/);
  });

  it("draws again instead of favouring the letters a byte can land on twice", () => {
    // 252 and up would fold back onto the start of a 36 character alphabet.
    const drawn = [ 255, 254, 253, 252, ...Array.from({ length: 12 }, (_, index) => index) ];
    let position = 0;
    const code = generateInviteCode((size) => Uint8Array.from({ length: size }, () => drawn[position++] ?? 0));

    expect(code).toBe("abcdefghijkl");
  });
});

import { describe, expect, it } from "vitest";
import { buildInviteUrl, extractInviteCode, generateInviteCode } from "./inviteCode";

describe("extractInviteCode", () => {
  it("takes a bare code as it is", () => {
    expect(extractInviteCode("aB3xY9")).toBe("aB3xY9");
    expect(extractInviteCode("  demo  ")).toBe("demo");
  });

  it("pulls the code out of a pasted link", () => {
    expect(extractInviteCode("https://casa.exemplo/entrar/aB3xY9")).toBe("aB3xY9");
    expect(extractInviteCode("https://user.github.io/colmeia/entrar/aB3xY9")).toBe("aB3xY9");
    expect(extractInviteCode("https://casa.exemplo/entrar/aB3xY9/")).toBe("aB3xY9");
    expect(extractInviteCode("https://casa.exemplo/entrar/aB3xY9?de=zap#topo")).toBe("aB3xY9");
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
    const url = buildInviteUrl("https://user.github.io", "/colmeia/", "aB3xY9");
    expect(extractInviteCode(url)).toBe("aB3xY9");
  });
});

describe("generateInviteCode", () => {
  it("draws a ten character URL-safe code", () => {
    const code = generateInviteCode((size) => Uint8Array.from({ length: size }, (_, index) => index));
    expect(code).toBe("abcdefghij");
    expect(extractInviteCode(code)).toBe(code);
  });
});

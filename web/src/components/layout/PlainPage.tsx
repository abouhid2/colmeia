import type { ReactNode } from "react";

/** Full-screen pages with no navigation: landing, new colmeia, invite. */
export function PlainPage({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-viewport w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
      {children}
    </main>
  );
}

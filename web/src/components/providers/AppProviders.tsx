import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { createApi } from "../../api";
import { ApiContext } from "../../hooks/useApi";
import { SessionProvider } from "./SessionProvider";
import { ToastProvider } from "./ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [api] = useState(createApi);
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5_000 } } }));

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={api}>
        <ToastProvider>
          <SessionProvider>{children}</SessionProvider>
        </ToastProvider>
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}

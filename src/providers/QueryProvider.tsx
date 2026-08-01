"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Serve cached data for a minute before refetching in the
                        // background. Anything that must be fresh sooner is
                        // invalidated explicitly — see utils/moneyQueries.
                        staleTime: 1000 * 60,
                        // Must stay well above staleTime: this is how long data
                        // survives after a component unmounts. At 0 every cache
                        // entry was dropped on navigation, so per-query staleTime
                        // never had anything left to serve.
                        gcTime: 1000 * 60 * 5,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

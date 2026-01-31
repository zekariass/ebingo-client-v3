"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "./queryClient";
// import { clientEnv } from "@/lib/env";

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => makeQueryClient());
    return (
        <QueryClientProvider client={client}>
            {children}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            {/* {clientEnv.NEXT_PUBLIC_NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />} */}
        </QueryClientProvider>
    );
}

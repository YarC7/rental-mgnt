"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu nhà trọ rất ít thay đổi real-time → cache 5 phút
            staleTime: 5 * 60 * 1000,
            // Giữ cache trong memory 10 phút sau khi component unmount
            gcTime: 10 * 60 * 1000,
            // Không refetch khi user quay lại tab
            refetchOnWindowFocus: false,
            // Không refetch khi reconnect mạng (dữ liệu vẫn valid)
            refetchOnReconnect: false,
            // Chỉ retry 1 lần khi lỗi (tránh spam API gây Circuit Breaker)
            retry: 1,
            retryDelay: 3000, // Chờ 3 giây trước khi retry
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
      <Toaster position="top-right" closeButton />
    </ThemeProvider>
  );
}

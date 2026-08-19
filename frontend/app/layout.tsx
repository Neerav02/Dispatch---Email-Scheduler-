'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>Dispatch — ReachInbox Email Scheduler Engine</title>
        <meta name="description" content="Full-stack, restart-safe, rate-limited email scheduling engine with an interactive 3D control tower dashboard." />
      </head>
      <body className="bg-canvas text-fog font-sans antialiased selection:bg-ember-magenta selection:text-canvas">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}

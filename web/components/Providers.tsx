"use client";

import type { ReactNode } from "react";

// NextAuth's SessionProvider has been removed — auth now runs through the
// Supabase browser client (see lib/supabase/client.ts), which manages the
// shared session cookie itself and needs no React context provider. This
// component is kept as a passthrough so app/layout.tsx doesn't need changing,
// and as a home for any future client-side providers.
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

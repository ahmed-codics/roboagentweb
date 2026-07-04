"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DesktopAuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "roboagent://auth";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/desktop-auth")}`);
    } else if (status === "authenticated" && session) {
      // Create the callback URI with the token
      const token = (session as any).accessToken || "dummy_token_if_missing";
      const targetUri = `${callbackUrl}?token=${encodeURIComponent(token)}`;
      
      // Redirect to the IDE
      window.location.href = targetUri;
    }
  }, [status, session, router, callbackUrl]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">Authenticating...</h2>
        <p className="mt-2 text-sm text-slate-500">Please wait while we log you into the desktop app.</p>
        <div className="mt-4 flex justify-center">
          <svg className="h-8 w-8 animate-spin text-cyan-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

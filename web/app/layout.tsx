import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "RoboAgent — The AI IDE Built for Robotics",
    template: "%s · RoboAgent",
  },
  description:
    "RoboAgent is the AI-native development environment for ROS2, embedded systems, simulation, and autonomous robots. Understand your robot. Not just your code.",
  metadataBase: new URL("https://roboagent.ai"),
  openGraph: {
    title: "RoboAgent — The AI IDE Built for Robotics",
    description:
      "AI-native robotics development. ROS2 workspace intelligence, simulation-in-the-loop, and autonomous debugging agents.",
    type: "website",
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Geist / Geist Mono carry the product UI; Unbounded is the RoboAgent
            wordmark face declared in the shared brand system (rc_website app.css). */}
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Unbounded:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-600 antialiased font-sans overflow-x-hidden">
        {/* One quiet, static brand wash anchored to the top of the page. The
            previous treatment was two full-page pulsing blur orbs sitting behind
            every route — the most recognizable AI-template signature there is. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-200/40 to-emerald-100/30 blur-[130px]" />
        </div>
        <Providers>
          <Nav />
          <main className="relative">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-600 antialiased font-sans overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        <Nav />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

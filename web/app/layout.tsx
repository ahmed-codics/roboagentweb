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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-ink antialiased font-sans">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-glow" />
        <Nav />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

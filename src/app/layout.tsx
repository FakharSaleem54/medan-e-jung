import type { Metadata } from "next";
import "./globals.css";
import WarBackground from "@/components/WarBackground";
import IntroWrapper from "@/components/IntroWrapper";

export const metadata: Metadata = {
  title: "MEDAN E JUNG — DURRANI Family Team Balancer",
  description: "Private COD Mobile tournament team balancer for the DURRANI family.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col relative">
        <WarBackground />
        <div className="relative z-10 flex flex-col min-h-full">
          <IntroWrapper>
            {children}
          </IntroWrapper>
        </div>
      </body>
    </html>
  );
}

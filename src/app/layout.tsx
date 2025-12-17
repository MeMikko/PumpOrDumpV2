export const dynamic = "force-dynamic";
export const revalidate = 0;

import "./globals.css";
import dynamicImport from "next/dynamic";

import Providers from "./providers"; // ✅ oikea polku ja casing
import SvgSizeNormalizer from "./components/SvgSizeNormalizer";
import AppHeader from "./components/AppHeader";

const BottomNav = dynamicImport(() => import("./components/BottomNav"), {
  ssr: false,
});
const DesktopNav = dynamicImport(() => import("./components/DesktopNav"), {
  ssr: false,
});
const MiniAppInit = dynamicImport(() => import("./MiniAppInit"), {
  ssr: false,
});

// Farcaster MiniApp Embed metadata (EI MUUTETTU)
const miniAppEmbed = `{
  "version": "1",
  "requestUser": true,
  "requestProfilePhoto": true,
  "imageUrl": "https://pumpordump-app.vercel.app/og.png",
  "button": {
    "title": "Pump or Dump",
    "action": {
      "type": "launch_frame",
      "name": "Pump or Dump",
      "url": "https://pumpordump-app.vercel.app/",
      "splashImageUrl": "https://pumpordump-app.vercel.app/splash.png",
      "splashBackgroundColor": "#050617"
    }
  }
}`;

export const metadata = {
  title: "Pump or Dump",
  description: "Predict crypto trends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Standard OG tags */}
        <meta property="og:title" content="PUMP OR DUMP" />
        <meta property="og:description" content="Predict. Earn. Dominate." />
        <meta
          property="og:image"
          content="https://pumpordump-app.vercel.app/og.png"
        />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Farcaster MiniApp tags */}
        <meta name="fc:miniapp" content={miniAppEmbed} />
        <meta name="fc:frame" content={miniAppEmbed} />

        {/* Base App ID */}
        <meta name="base:app_id" content="693b1675e6be54f5ed71d685" />

        {/* ⭐ BASE MINIAPP REQUIRED FIELDS */}
        <meta
          name="base:webhook_url"
          content="https://pumpordump-app.vercel.app/api/base-webhook"
        />
        <meta name="base:og_title" content="Pump or Dump" />
        <meta
          name="base:og_description"
          content="Predict crypto trends. Earn rewards for being right."
        />
        <meta
          name="base:og_image_url"
          content="https://pumpordump-app.vercel.app/og.png"
        />
        <meta name="base:noindex" content="false" />
      </head>

      <body>
        <Providers>
          <MiniAppInit />
          <SvgSizeNormalizer />

          {/* ✅ Global Header (no tagline here) */}
          <AppHeader />

          {/* App content */}
          {children}

          {/* Mobile / MiniApp navigation */}
          <div className="block md:hidden">
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}

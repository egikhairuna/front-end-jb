import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ClientOnly } from "@/components/shared/ClientOnly";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import GTM, { GTMNoScript } from "@/components/analytics/GTM";
import Script from "next/script";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { Suspense } from "react";

const dinPro = localFont({
  src: [
    {
      path: "../../public/fonts/DINPro-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/DINPro-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/DINPro-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/DINPro-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/DINPro-Black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/DINPro-Italic.woff",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-dinpro",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};


export const metadata: Metadata = {
  metadataBase: new URL('https://jamesboogie.com'),
  title: "James Boogie",
  description: "Discover the pop military vibes jackets and clothing, a journey where every detail is refined, every process considered, and James Boogie arrives at its most deliberate point.",
  keywords: ["James Boogie", "Pop Military", "streetwear", "fashion", "Bandung", "Indonesia", "military fashion", "contemporary fashion"],
  authors: [{ name: "James Boogie" }],
  creator: "James Boogie",
  publisher: "James Boogie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jamesboogie.com",
    siteName: "James Boogie",
    title: "James Boogie - an Pop Military Brands",
    description: "Discover the pop military vibes jackets and clothing, a journey where every detail is refined, every process considered, and James Boogie arrives at its most deliberate point.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "James Boogie - Pop Military Brand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "James Boogie",
    description: "Discover the pop military vibes jackets and clothing, a journey where every detail is refined, every process considered, and James Boogie arrives at its most deliberate point.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "CU6s5LaFk19P3awyVpyNe4dQfWK7f0SfpcXyohiCt4Y",
    yandex: "ff8b56440be09ff0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dinPro.variable} antialiased bg-background text-foreground font-sans`}
      >
        <GTMNoScript />
        <GTM />
        {/* Meta Pixel */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <ClientOnly>
          <ConditionalNavbar>
            <Navbar />
          </ConditionalNavbar>
        </ClientOnly>
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}

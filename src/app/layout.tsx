import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { Footer } from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://jamesboogie.com'),
  title: "James Boogie",
  description: "Discover James Boogie's premium Pop Military streetwear collection. Explore our latest fashion pieces blending military aesthetics with contemporary street style. Shop online or visit our Bandung flagship store.",
  keywords: ["James Boogie", "Pop Military", "streetwear", "fashion", "Bandung", "Indonesia", "military fashion", "premium streetwear", "contemporary fashion"],
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
    title: "James Boogie - Pop Military Brand | Premium Streetwear Fashion",
    description: "Discover James Boogie's premium Pop Military streetwear collection. Explore our latest fashion pieces blending military aesthetics with contemporary street style.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "James Boogie - Pop Military Brand",
      },
    ],
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
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}

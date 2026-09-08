import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import { SessionProvider } from "@/components/auth/session-provider";
import { PWARegister } from "@/components/public/pwa-register";
import { ChatWidget } from "@/components/public/chat-widget";
import { LanguageProvider } from "@/lib/language-context";
import { auth } from "@/lib/auth";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HAAJ — Event Ticketing",
    template: "%s — HAAJ Events",
  },
  description: "Event ticketing platform for HAAJ (Himpunan Astronomi Amatir Jakarta) — the Amateur Astronomers Association of Jakarta. Bringing astronomy to the people since 1984.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HAAJ",
  },
};

export const viewport: Viewport = {
  themeColor: "#B48E5A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HAAJ" />
      </head>
      <body
        className={`${instrumentSerif.variable} ${interTight.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <LanguageProvider>
              {children}
              <PWARegister />
              <ChatWidget />
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

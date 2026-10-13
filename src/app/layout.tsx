import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/layout";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

// next/font no admite pesos fijos junto con ejes extra: se carga la fuente
// variable completa (incluye 500, 700 y 800) con el eje opsz, como el legacy.
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  axes: ["opsz"],
  fallback: ["Trebuchet MS", "Arial", "sans-serif"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "QA Center · BluePixel",
    template: "%s · BluePixel",
  },
  description:
    "Hub central de calidad de BluePixel: proceso de QA y gestión de pruebas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${bricolageGrotesque.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="qa-theme"
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

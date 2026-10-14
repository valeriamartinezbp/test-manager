import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Red_Hat_Display } from "next/font/google";

import { ThemeProvider } from "@/components/layout";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

// Fuentes del tema de tweakcn. --font-serif (Georgia) es una fuente de sistema
// y no se carga; se define directamente en globals.css.
const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
      className={`${redHatDisplay.variable} ${jetBrainsMono.variable} h-full antialiased`}
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

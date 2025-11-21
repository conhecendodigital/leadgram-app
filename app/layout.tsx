import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "react-hot-toast";
import ThemeInitializer from "@/components/theme-initializer";
import { ErrorBoundary } from "@/components/error-boundary";
import MotionProvider from "@/components/motion-provider";
import CookieConsent from "@/components/CookieConsent";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700"],
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "Leadgram - Gerenciamento de Conteúdo para Criadores",
  description: "Plataforma completa de gerenciamento de conteúdo para criadores digitais",
  other: {
    'preconnect': 'https://api.instagram.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning style={{colorScheme: 'light'}}>
      <head>
        <link rel="preconnect" href="https://api.instagram.com" />
        <link rel="preconnect" href="https://api.mercadopago.com" />
        <link rel="dns-prefetch" href="https://graph.instagram.com" />
      </head>
      <body
        className={`${montserrat.variable} font-sans antialiased bg-white`}
      >
        <MotionProvider>
          <ThemeProvider>
            <ThemeInitializer />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <CookieConsent />
        </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

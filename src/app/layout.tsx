import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { QueryProvider } from '@/components/providers/query-provider';

export const runtime = 'edge';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#3182F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Miegraine | Platform Kasir Pintar & Manajemen Bisnis Ritel Modern',
    template: '%s | Miegraine',
  },
  description:
    'Aplikasi kasir berkecepatan tinggi dengan manajemen multi-satuan bertingkat, buku piutang digital, dan laporan laba rugi otomatis untuk segala jenis toko ritel.',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/crown-logo.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/logo.svg',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Miegraine',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#F2F4F6] text-[#191F28] min-h-screen selection:bg-[#3182F6] selection:text-white">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

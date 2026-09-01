import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disables double-render in dev mode for 2x faster execution
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Turbocharges icon and package imports during development
    optimizePackageImports: [
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'drizzle-orm',
      'zod',
      'dexie',
    ],
  },
};

export default nextConfig;

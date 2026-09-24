import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // REQUIRED. The kit ships TypeScript source so its `'use client'` directives
  // survive to the bundler that enforces them — a pre-compiled library routinely
  // loses or hoists them, silently turning a client module into a server one.
  // Without this line nothing in the kit resolves.
  transpilePackages: ['@usequeek/theme-kit'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;

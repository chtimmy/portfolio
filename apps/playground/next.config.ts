import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Compile the toolkit from source so edits in packages/toolkit hot-reload here.
  transpilePackages: ['@umbra/motion'],
};

export default nextConfig;

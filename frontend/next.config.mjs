/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add this to handle hydration issues
  experimental: {
    // This can help with hydration mismatches
  },
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
   allowedDevOrigins: ['192.168.0.100', 'localhost:3000' ,'https://fast-ex.loca.lt'],
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow testing from devices on the local network
  // @ts-ignore - The property might not be perfectly typed in this version
  allowedDevOrigins: ["192.168.88.172", "localhost"],
};

export default nextConfig;

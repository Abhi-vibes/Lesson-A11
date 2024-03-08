import { config as dotenvConfig } from "dotenv";

dotenvConfig();
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

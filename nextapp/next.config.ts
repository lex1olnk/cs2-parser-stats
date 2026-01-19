import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // На клиенте исключаем нативные модули
      config.resolve.fallback = {
        "@laihoe/demoparser2": false,
        "demoparser2-win32-x64-msvc": false,
      };
    }

    // Исключаем .node файлы из обработки webpack
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack", "url-loader"],
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.fastcup.net",
        port: "",
        pathname: "/avatars/users/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "distribution.faceit-cdn.net",
        port: "",
        pathname: "/images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "assets.faceit-cdn.net",
        port: "",
        pathname: "/avatars/**",
        search: "",
      },
    ],
  },
  // Отключаем проверку типов во время сборки для ускорения
  typescript: {
    ignoreBuildErrors: true,
  },
  // Отключаем ESLint во время сборки
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;

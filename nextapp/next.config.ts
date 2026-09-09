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
      // Аватары из Steam — приходят при логине через Steam Web API.
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "avatars.cloudflare.steamstatic.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  // Проверка типов включена: сейчас ошибок нет, и пусть сборка падает,
  // если они появятся.
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint пока вне сборки: в коде ~130 накопленных замечаний
  // (в основном any в парсере и неиспользуемые импорты). Разгребается
  // отдельно, см. plan.md; проверять руками — npm run lint.
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;

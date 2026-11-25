import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Always send metadata in <head>. By default Next.js streams it into <body> for user agents
  // outside its bot list, and some link preview fetchers (e.g. Telegram's) aren't on that list.
  htmlLimitedBots: /.*/,
};

export default withNextIntl(nextConfig);

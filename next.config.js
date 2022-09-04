/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["www.hko.gov.hk"],
  },
};

module.exports = nextConfig;

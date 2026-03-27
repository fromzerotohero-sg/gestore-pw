/** @type {import('next').NextConfig} */
const nextConfig = {
  // Abilita strict mode per migliori performance e debug
  reactStrictMode: true,
  
  // Configurazione immagini (se necessario in futuro)
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

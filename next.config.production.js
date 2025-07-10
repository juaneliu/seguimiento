/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima para producción
  swcMinify: true,
  
  // Asegurar que los archivos estáticos se sirvan correctamente
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Configuración de headers para archivos estáticos
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
        ],
      },
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ]
  },
  
  // Configuración de output para producción
  output: 'standalone',
  
  // Configuración de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimizaciones
  experimental: {
    optimizeCss: true,
  },
  
  // Configuración de transpilación
  transpilePackages: ['@radix-ui/react-icons'],
}

module.exports = nextConfig

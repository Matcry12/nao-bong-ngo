import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Dev only: serve POST /api/coach by calling the same handler Vercel runs.
function coachApi(env) {
  return {
    name: 'coach-api',
    configureServer(server) {
      server.middlewares.use('/api/coach', async (req, res) => {
        process.env.DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY || ''
        const send = (code, obj) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
        }
        res.status = (code) => ({ json: (obj) => send(code, obj) })
        try {
          const chunks = []
          for await (const c of req) chunks.push(c)
          try { req.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null') } catch { req.body = null }
          const { default: handler } = await server.ssrLoadModule('/api/coach.js')
          await handler(req, res)
        } catch {
          send(503, { error: 'unavailable' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      coachApi(env),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          name: 'Não bỏng ngô',
          short_name: 'Não bỏng ngô',
          description: 'Trò chơi tự đánh giá và tìm giải pháp cho não bỏng ngô',
          lang: 'vi',
          theme_color: '#FF9F1C',
          background_color: '#FFFFFF',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === 'https://fonts.googleapis.com' ||
                url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  }
})

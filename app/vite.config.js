import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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
  return { plugins: [react(), coachApi(env)] }
})

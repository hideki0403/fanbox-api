import Fastify from 'fastify'
import config from '@/config'
import * as capture from '@/capture'

export default async function () {
    const app = Fastify()

    app.setErrorHandler((err, req, res) => {
        console.error(`RequestID: ${req.id},`, err)
        res.status(500).send(`Internal Server Error (RequestID: ${req.id})`)
    })

    app.get('/api/:type', async (req, res) => {
        const type = (req.params as any).type as keyof typeof capture.ApiType
        if (!Object.keys(capture.ApiType).includes(type)) return res.status(400).send('Bad Request')

        const data = await capture.get(type)
        res.send(data)
    })

    app.addHook('onResponse', (req, res) => {
        if (!(req.method === 'GET' || req.method === 'HEAD')) return
        console.info(`${req.method} ${res.statusCode} ${req.url} (${res.getResponseTime()}ms)`)
    })

    app.listen({
        port: Number(config.server.port),
        host: '0.0.0.0'
    }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }

        console.info(`Server listening at ${address}`)
    })
}
import Fastify from 'fastify'
import config from '@/config.js'
import { get } from '@/capture/fetch.js'
import { ApiType } from '@/capture/def.js'

export default async function () {
    const app = Fastify()

    app.setErrorHandler((err, req, res) => {
        console.error(`RequestID: ${req.id},`, err)
        res.status(500).send(`Internal Server Error (RequestID: ${req.id})`)
    })

    app.get('/api/users', async (_, res) => {
        const planData = (await get('plan')).body.plans
        const userData = (await get('relationship')).body

        const planMap = new Map(planData.map(p => [p.id, p.fee]))
        const merged = {} as Record<string, number>

        for (const x of userData) {
            const fee = planMap.get(x.planId)
            if (fee == null) continue
            merged[x.user.userId] = fee
        }

        res.send(merged)
    })

    app.get('/api/:type', async (req, res) => {
        const type = (req.params as any).type as keyof typeof ApiType
        if (!Object.keys(ApiType).includes(type)) return res.status(400).send('Bad Request')

        const data = await get(type)
        res.send(data)
    })

    app.addHook('onResponse', (req, res) => {
        if (!(req.method === 'GET' || req.method === 'HEAD')) return
        console.info(`${req.method} ${res.statusCode} ${req.url} (${res.elapsedTime}ms)`)
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

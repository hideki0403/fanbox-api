import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import api from '@/api.js'
import config from '@/config.js'

if (config.sentry.dsn) {
	Sentry.init({
		dsn: config.sentry.dsn,
		tracesSampleRate: config.sentry.tracesSampleRate,
		profilesSampleRate: config.sentry.profilesSampleRate,
		integrations: [nodeProfilingIntegration()],
	})
}

api()

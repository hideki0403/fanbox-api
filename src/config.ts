import fs from 'node:fs'
import appRootPath from 'app-root-path'
import deepmerge from 'deepmerge'
import { FAILSAFE_SCHEMA, load } from 'js-yaml'
import type { JsonObject } from '@/types/json.js'

const config = load(fs.readFileSync(appRootPath.resolve('./config.yaml'), 'utf8'), { schema: FAILSAFE_SCHEMA }) as JsonObject

const fallbackConfig = {
	pixiv: {
		email: '',
		password: '',
	},
	server: {
		port: '3000',
	},
	cf_clearance: '',
	user_agent: '',
	headless: 'true',
	errorLog: 'false',
	sentry: {
		dsn: '',
		tracesSampleRate: 0,
		profilesSampleRate: 0,
	},
}

export default deepmerge(fallbackConfig, config) as typeof fallbackConfig

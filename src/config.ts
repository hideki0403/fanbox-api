import { load, FAILSAFE_SCHEMA } from 'js-yaml'
import fs from 'fs'
import appRootPath from 'app-root-path'
import deepmerge from 'deepmerge'

const config = load(fs.readFileSync(appRootPath.resolve('./config.yaml'), 'utf8'), { schema: FAILSAFE_SCHEMA }) as any

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
}

export default deepmerge(fallbackConfig, config)

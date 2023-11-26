import fs from 'fs'
import appRootPath from 'app-root-path'
import type { Protocol } from 'puppeteer'

const cookiePath = appRootPath.resolve('./cookie.json')

export function save(cookies: Protocol.Network.Cookie[]) {
    fs.writeFileSync(cookiePath, JSON.stringify(cookies))
}

export function load() {
    const exists = fs.existsSync(cookiePath)
    if (!exists) return null
    return JSON.parse(fs.readFileSync(cookiePath, 'utf8')) as Protocol.Network.CookieParam[]
}

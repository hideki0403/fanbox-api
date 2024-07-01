import fs from 'fs'
import appRootPath from 'app-root-path'
import type { Cookie, CookieParam } from 'puppeteer'

const cookiePath = appRootPath.resolve('./cookie.json')

export function save(cookies: Cookie[]) {
    fs.writeFileSync(cookiePath, JSON.stringify(cookies))
}

export function load() {
    const exists = fs.existsSync(cookiePath)
    if (!exists) return null
    return JSON.parse(fs.readFileSync(cookiePath, 'utf8')) as CookieParam[]
}

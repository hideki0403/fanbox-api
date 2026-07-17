import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import appRootPath from 'app-root-path'
import config from '@/config.js'
import * as cookie from '@/capture/cookie.js'
import * as screenshot from '@/capture/screenshot.js'
import { ApiType } from '@/capture/def.js'
import { z } from 'zod'

export async function get<T extends keyof typeof ApiType>(type: T): Promise<z.infer<typeof ApiType[T]['schema']>> {
    let listener = null as null | ((e: any) => void)
    let result = null as null | any

    const emit = (e: any) => {
        const parsed = ApiType[type].schema.parse(e)
        result = parsed
        if (listener) {
            listener(parsed)
        }
    }
    const setListener = (fn: (e: any) => void) => {
        listener = fn
        if (result) {
            fn(result)
        }
    }

    const extensions = getExtensions()
    const browserArgs = []

    if (extensions.length) {
        browserArgs.push(`--disable-extensions-except=${extensions.join(',')}`)
        browserArgs.push(`--load-extension=${extensions.join(',')}`)
    }

    const browser = await puppeteer.launch({
        headless: config.headless === 'true',
        slowMo: 50,
        args: browserArgs
    })

    const page = await browser.newPage()
    await page.setRequestInterception(true)
    await page.setUserAgent(config.user_agent)

    const cookies = cookie.load()
    if (cookies) {
        await page.setCookie(...cookies)
    }

    const cfClearance = cookies?.find((c) => c.name === 'cf_clearance')
    if (!cfClearance || cfClearance.value !== config.cf_clearance) {
        await page.setCookie({
            name: 'cf_clearance',
            value: config.cf_clearance,
            domain: '.fanbox.cc',
        })
    }

    page.on('request', (request) => {
        if (page.url().startsWith('https://www.fanbox.cc') && ['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
            request.abort()
        } else {
            request.continue()
        }
    })

    page.on('response', async (res) => {
        if (res.url().startsWith(ApiType[type].hookUrl)) {
            const data = await res.json()
            emit(data)
        }
    })

    try {
        await page.goto(ApiType[type].pageUrl, {
            waitUntil: ['load', 'networkidle2'],
        })

        // ログイン処理
        if (!page.url().startsWith('https://www.fanbox.cc')) {
            await page.type('input[autocomplete~="username"]', config.pixiv.email);
            await page.type('input[autocomplete~="current-password"]', config.pixiv.password);
            await page.click('div+button[type="submit"]')
            await page.waitForNavigation({
                waitUntil: ['load', 'networkidle2'],
            })
            await page.goto(ApiType[type].pageUrl, {
                waitUntil: ['load', 'networkidle2'],
            })
        }

        // captchaに引っかかったら停止
        if (await page.$('#challenge-form')) {
            throw new Error('Captcha detected. Please check your cf_clearance.')
        }

        cookie.save(await page.cookies())
    } catch (e) {
        if (config.errorLog === 'true') {
            screenshot.save(await page.screenshot())
        }

        console.error(e)
        throw e
    } finally {
        await page.close()
        await browser.close()
    }

    return new Promise((resolve) => {
        setListener(resolve)
    })
}

function getExtensions() {
    try {
        const extensionPath = appRootPath.resolve('./extensions')
        const files = fs.readdirSync(extensionPath, { withFileTypes: true })
        return files.filter((file) => file.isDirectory()).map((file) => path.join(extensionPath, file.name))
    } catch (e) {
        return []
    }
}

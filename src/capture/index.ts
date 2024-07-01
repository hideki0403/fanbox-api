import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import appRootPath from 'app-root-path'
import config from '@/config'
import * as cookie from '@/capture/cookie'
import * as screenshot from '@/capture/screenshot'

export const ApiType = {
    'relationship': {
        pageUrl: 'https://www.fanbox.cc/manage/relationships',
        hookUrl: 'https://api.fanbox.cc/relationship.listFans?status=supporter',
    },
    'plan': {
        pageUrl: 'https://www.fanbox.cc/manage/plans',
        hookUrl: 'https://api.fanbox.cc/plan.listCreator?userId=',
    },
} as const

export async function get(type: keyof typeof ApiType): Promise<any> {
    let listener = null as null | ((e: any) => void)
    let result = null as null | any

    const emit = (e: any) => {
        result = e
        if (listener) {
            listener(e)
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
    await page.setRequestInterception(true);

    const cookies = cookie.load()
    if (cookies) {
        await page.setCookie(...cookies)
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

        if (!page.url().startsWith('https://www.fanbox.cc')) {
            await page.type('input[autocomplete="username"]', config.pixiv.email);
            await page.type('input[autocomplete="current-password"]', config.pixiv.password);
            await page.click('div+button[type="submit"]')
            await page.waitForNavigation({
                waitUntil: ['load', 'networkidle2'],
            })
            await page.goto(ApiType[type].pageUrl, {
                waitUntil: ['load', 'networkidle2'],
            })
        }
    } catch (e) {
        if (config.errorLog === 'true') {
            screenshot.save(await page.screenshot())
        }
        console.error(e)

        await page.close()
        await browser.close()
        
        throw e
    }

    cookie.save(await page.cookies())
    await page.close()
    await browser.close()

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

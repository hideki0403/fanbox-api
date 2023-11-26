import puppeteer from 'puppeteer'
import config from '@/config'
import * as cookie from '@/capture/cookie'

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

    const browser = await puppeteer.launch({
        headless: config.headless,
        slowMo: 50,
    })
    const page = await browser.newPage()
    await page.setRequestInterception(true);

    const cookies = cookie.load()
    if (cookies) {
        await page.setCookie(...cookies)
    }

    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
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

    await page.goto(ApiType[type].pageUrl, {
        waitUntil: ['load', 'networkidle2'],
    })

    if (!page.url().startsWith('https://www.fanbox.cc')) {
        await page.type('input[autocomplete="username"]', config.pixiv.email);
        await page.type('input[autocomplete="current-password"]', config.pixiv.password);
        await page.click('button[type="submit"]')
        await page.waitForNavigation({
            waitUntil: ['load', 'networkidle2'],
        })
        await page.goto(ApiType[type].pageUrl, {
            waitUntil: ['load', 'networkidle2'],
        })
    }

    cookie.save(await page.cookies())
    await page.close()
    await browser.close()

    return new Promise((resolve) => {
        setListener(resolve)
    })
}

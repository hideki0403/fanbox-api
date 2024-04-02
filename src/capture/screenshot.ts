import fs from 'fs'
import appRootPath from 'app-root-path'
import path from 'path'

const screenshotPath = appRootPath.resolve('./screenshot')

export function save(picture: Buffer) {
    fs.writeFileSync(path.join(screenshotPath, `${Date.now()}.png`), picture)
}

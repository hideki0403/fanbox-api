import fs from 'node:fs'
import path from 'node:path'
import appRootPath from 'app-root-path'

const screenshotPath = appRootPath.resolve('./screenshot')

export function save(picture: Parameters<typeof fs.writeFileSync>[1]) {
	fs.writeFileSync(path.join(screenshotPath, `${Date.now()}.png`), picture)
}

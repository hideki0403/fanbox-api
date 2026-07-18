import fs from 'node:fs'

if (fs.existsSync('build')) {
	fs.rmSync('build', { recursive: true })
}

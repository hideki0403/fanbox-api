import fs from 'fs'

if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true })
}

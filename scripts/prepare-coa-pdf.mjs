import { cp, mkdir, copyFile, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const packageFile = require.resolve('pdfjs-dist/package.json')
const packageRoot = path.dirname(packageFile)

const { version } = JSON.parse(
  await readFile(packageFile, 'utf8'),
)

const destination = path.join(
  process.cwd(),
  'public',
  'coa-pdf-assets',
  version,
)

await mkdir(destination, { recursive: true })

await copyFile(
  path.join(packageRoot, 'build', 'pdf.worker.min.mjs'),
  path.join(destination, 'pdf.worker.min.mjs'),
)

await copyFile(
  path.join(packageRoot, 'LICENSE'),
  path.join(destination, 'LICENSE'),
)

for (const folder of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  await cp(
    path.join(packageRoot, folder),
    path.join(destination, folder),
    {
      recursive: true,
      force: true,
    },
  )
}

console.log(
  `PDF.js ${version}: worker dan aset siap di public/coa-pdf-assets/${version}`,
)
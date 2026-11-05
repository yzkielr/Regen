import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

export type TutorialImage = {
  id: string
  src: string
  width: number
  height: number
}

// The pages are built statically; file changes go live with the next deployment.
export async function loadTutorialImages(folder: 'tutorial' | 'basic', count: number): Promise<TutorialImage[]> {
  const images: TutorialImage[] = []
  for (let index = 1; index <= count; index++) {
    const id = String(index).padStart(2, '0')
    const matches = ['png', 'jpg', 'jpeg', 'webp']
      .map((extension) => `${id}.${extension}`)
      .filter((filename) => existsSync(path.join(process.cwd(), 'public', folder, filename)))

    if (matches.length === 0) continue
    if (matches.length > 1) {
      throw new Error(`Keep only one image for ${id} in public/${folder}: ${matches.join(', ')}`)
    }

    const filename = matches[0]
    const bytes = readFileSync(path.join(process.cwd(), 'public', folder, filename))
    const metadata = await sharp(bytes).metadata()
    const { width, height } = metadata.autoOrient
    const version = createHash('sha256').update(bytes).digest('hex').slice(0, 12)
    images.push({ id, src: `/${folder}/${filename}?v=${version}`, width, height })
  }
  return images
}

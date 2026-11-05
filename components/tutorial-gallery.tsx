import Image from 'next/image'
import { Logo } from '@/components/logo'
import type { TutorialImage } from '@/lib/tutorial-images'

export function TutorialGallery({ title, images }: { title: string; images: TutorialImage[] }) {
  return (
    <main lang="id" className="min-h-screen bg-[#edf2ef] text-primary">
      <header className="mx-auto flex max-w-[1008px] items-center justify-between gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Logo />
        <div className="text-right">
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">Regen Longevity Lab</p>
        </div>
      </header>

      {images.length === 0 ? (
        <p className="mx-auto max-w-[1008px] px-4 py-12 text-center text-muted-foreground sm:px-6">
          Materi tutorial sedang diperbarui.
        </p>
      ) : (
        <ol aria-label={`Halaman ${title}`} className="mx-auto flex max-w-[1008px] list-none flex-col gap-4 px-2 pb-8 sm:gap-6 sm:px-6 sm:pb-12">
          {images.map((image, index) => (
            <li key={image.id} id={`halaman-${image.id}`} className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5">
              <Image
                src={image.src}
                alt={`${title} Regen Longevity Lab, halaman ${index + 1} dari ${images.length}`}
                width={image.width}
                height={image.height}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="block h-auto w-full"
              />
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}

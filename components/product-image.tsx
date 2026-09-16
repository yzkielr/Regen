'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'
import Image from 'next/image'
import { useRegion } from '@/components/region-provider'

type ProductImageProps = Omit<ComponentProps<typeof Image>, 'ref'>

// Keep the original image and its loading behavior when the asset exists.
// Missing product photos show an explicit placeholder, never another product.
export function ProductImage({ src, alt, fill, width, height, className, style, onError, ...props }: ProductImageProps) {
  const { language } = useRegion()
  const imageRef = useRef<HTMLImageElement>(null)
  const [failedSource, setFailedSource] = useState<ProductImageProps['src'] | null>(null)
  const label = language === 'id' ? 'Foto segera tersedia'
    : language === 'ms' ? 'Foto akan tersedia' : 'Photo coming soon'

  useEffect(() => {
    // An SSR image may fail before React attaches its error handler.
    const image = imageRef.current
    if (image?.complete && image.naturalWidth === 0) setFailedSource(src)
  }, [src])

  if (failedSource === src) {
    return (
      <div
        data-photo-placeholder
        role={alt ? 'img' : undefined}
        aria-label={alt ? `${alt} — ${label}` : undefined}
        aria-hidden={alt ? undefined : true}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-primary/15 bg-secondary p-3 text-center text-primary ${className ?? ''}`}
        style={{
          ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : { width, height }),
          ...style,
        }}
      >
        <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4" y="4" width="24" height="24" rx="4" />
          <circle cx="12" cy="12" r="2" />
          <path d="m5 24 7-7 5 4 5-7 6 8" />
        </svg>
        <span className="text-xs font-medium leading-relaxed">{label}</span>
      </div>
    )
  }

  return (
    <Image
      {...props}
      ref={imageRef}
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={(event) => {
        setFailedSource(src)
        onError?.(event)
      }}
    />
  )
}

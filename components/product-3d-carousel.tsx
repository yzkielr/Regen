'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { products } from '@/lib/products'
import { useRegion } from '@/components/region-provider'
import { catalogCopy, getProductCopy } from '@/lib/product-copy'
import { getRegionalPriceAmount, getRegionalPriceLabel } from '@/lib/region-pricing'

interface WheelProduct {
  id: string
  name: string
  category: string
  price: string
  image: string
  tagline: string
  variantLabel: string
  showStartingPrice: boolean
  href: string
}

// PENGATURAN: ubah angka di sini untuk menyesuaikan gerakan.
const AUTO_SPEED = 12 // Derajat/detik. Nilai lebih besar = lebih cepat.
const MAX_RADIUS = 350 // Jarak produk dari pusat orbit pada desktop.
const FLOAT_HEIGHT = 6 // Naik/turun maksimal 6px dari posisi tengah.
const FLOAT_DRIFT = 4 // Gerakan menyerong maksimal 4px ke samping.
const FLOAT_TILT = 0.85 // Goyangan sangat kecil, dalam derajat.
const FLOAT_DURATION = 9500 // Satu siklus perlahan selama 9,5 detik.
const WHEEL_SENSITIVITY = 0.2
const DRAG_SENSITIVITY = 0.45
// Jumlah dan urutan selalu mengikuti katalog; tidak ada daftar produk manual.
const PRODUCT_COUNT = Math.max(products.length, 1)
const STEP = 360 / PRODUCT_COUNT
const DEG = Math.PI / 180
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
const wrapIndex = (index: number) =>
  ((index % PRODUCT_COUNT) + PRODUCT_COUNT) % PRODUCT_COUNT

// Hook ditempatkan di komponen anak, bukan di dalam map().
function OrbitProduct({
  product,
  index,
  rotation,
  radius,
  clock,
  active,
  onSelect,
}: {
  product: WheelProduct
  index: number
  rotation: MotionValue<number>
  radius: MotionValue<number>
  clock: MotionValue<number>
  active: boolean
  onSelect: () => void
}) {
  const angle = useTransform(rotation, (value) => (value + index * STEP) * DEG)
  const depth = useTransform(angle, (value) => (Math.cos(value) + 1) / 2)

  const transform = useTransform(() => {
    const theta = angle.get()
    const d = depth.get()
    const r = radius.get()
    const x = Math.sin(theta) * r
    const z = Math.cos(theta) * r
    const y = (d - 1) * 66
    // Kemiringan dibatasi agar label produk tetap menghadap ke pengunjung.
    const tilt = -Math.sin(theta) * 34
    const scale = 0.8 + d * 0.2

    return `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${tilt}deg) scale(${scale})`
  })
  const floatingTransform = useTransform(clock, (time) => {
    // Tiap produk bergerak dengan jeda berbeda: naik menyerong, lalu kembali.
    const phase = (time / FLOAT_DURATION) * Math.PI * 2 + index * 1.3
    const wave = Math.sin(phase)
    const driftX = wave * FLOAT_DRIFT
    const driftY = -wave * FLOAT_HEIGHT
    const sway = Math.cos(phase) * FLOAT_TILT
    return `translate3d(${driftX}px, ${driftY}px, 0) rotate(${sway}deg)`
  })
  const opacity = useTransform(depth, (d) => 0.26 + d * 0.74)
  const zIndex = useTransform(depth, (d) => Math.round(d * 100) + 1)
  const captionOpacity = useTransform(depth, (d) => 0.25 + d * 0.75)

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`Tampilkan ${product.name}`}
      aria-pressed={active}
      data-product-id={product.id}
      style={{ transform, opacity, zIndex, willChange: 'transform' }}
      className="absolute left-1/2 top-1/2 w-[156px] select-none rounded-2xl border-0 bg-transparent p-0 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21] focus-visible:ring-offset-4 sm:w-[210px] lg:w-[230px]"
    >
      {/* PNG/WebP transparan akan membuat produk melayang tanpa kotak latar. */}
      <motion.div
        style={{ transform: floatingTransform, willChange: 'transform' }}
        className="pointer-events-none relative h-[190px] w-full sm:h-[240px] lg:h-[260px]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          draggable={false}
          sizes="(max-width: 639px) 210px, (max-width: 1023px) 280px, 310px"
          priority={index === 0}
          className="object-contain drop-shadow-[0_18px_18px_rgba(0,63,53,0.16)]"
        />
      </motion.div>
      <motion.div
        style={{ opacity: captionOpacity }}
        className={`pointer-events-none mt-4 px-1 ${active ? 'visible' : 'invisible sm:visible'}`}
      >
        <h3 className="min-h-[40px] text-sm font-semibold leading-5 text-[#003F35] sm:text-base">
          {product.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#003F35]/70 sm:text-sm">
          {product.price}
        </p>
      </motion.div>
    </motion.button>
  )
}

export function Product3DCarousel() {
  const { region, language, href } = useRegion()
  const copy = catalogCopy[language]
  const catalogVariant = region.id === 'id' ? 'basic' : 'cartridge'
  const wheelProducts: WheelProduct[] = products.map((product) => {
    const localized = getProductCopy(product, language)
    return {
      id: product.slug,
      name: product.name,
      image: product.image || '/placeholder.svg',
      category: localized.category,
      tagline: localized.tagline,
      price: getRegionalPriceLabel(region, product.slug, catalogVariant),
      variantLabel: copy.variants[catalogVariant].label.toLowerCase(),
      showStartingPrice: region.id === 'id' &&
        getRegionalPriceAmount(region.id, product.slug, catalogVariant) !== null,
      href: href(`/product/${product.slug}`),
    }
  })
  const hostRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const hintId = useId()
  const rotation = useMotionValue(0)
  const radius = useMotionValue(130)
  const clock = useMotionValue(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  // Render pertama harus sama di server dan browser, termasuk preferensi gerakan.
  const reducedMotion = isHydrated && prefersReducedMotion
  const target = useRef(0)
  const activeRef = useRef(0)
  const hovered = useRef(false)
  const focused = useRef(false)
  const inView = useRef(false)
  const resumeAt = useRef(0)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressClick = useRef(false)
  const drag = useRef<{
    id: number
    startX: number
    startY: number
    startAngle: number
    moved: boolean
  } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    // Transform Motion baru dirender sesudah React selesai melakukan hydration.
    setIsHydrated(true)
  }, [])

  const clearWheelTimer = useCallback(() => {
    if (wheelTimer.current !== null) clearTimeout(wheelTimer.current)
    wheelTimer.current = null
  }, [])

  const moveTo = useCallback((angle: number) => {
    target.current = angle
    resumeAt.current = performance.now() + 1600
    if (reducedMotion) rotation.set(angle)
  }, [reducedMotion, rotation])

  const snap = useCallback(() => {
    moveTo(Math.round(target.current / STEP) * STEP)
  }, [moveTo])

  const stepBy = useCallback((direction: number) => {
    clearWheelTimer()
    moveTo((Math.round(target.current / STEP) - direction) * STEP)
  }, [clearWheelTimer, moveTo])

  const selectProduct = useCallback((index: number) => {
    clearWheelTimer()
    const destination = -index * STEP
    // Pilih putaran terdekat. Transisi produk terakhir -> pertama tetap mulus.
    const turns = Math.round((rotation.get() - destination) / 360)
    moveTo(destination + turns * 360)
  }, [clearWheelTimer, moveTo, rotation])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const fitViewport = () => {
      // Pakai lebar layar tanpa scrollbar, termasuk jika komponen berada
      // di dalam container max-width atau parent dengan padding horizontal.
      host.style.setProperty('--carousel-viewport-width', `${document.documentElement.clientWidth}px`)
      host.style.setProperty('--carousel-viewport-offset', `${-host.getBoundingClientRect().left}px`)
    }
    fitViewport()
    const observer = new ResizeObserver(fitViewport)
    observer.observe(host)
    observer.observe(document.documentElement)
    window.addEventListener('resize', fitViewport)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fitViewport)
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const resize = () => radius.set(clamp(stage.clientWidth * 0.3, 90, MAX_RADIUS))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    const visibility = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
    }, { threshold: 0.1 })
    visibility.observe(stage)
    return () => {
      observer.disconnect()
      visibility.disconnect()
    }
  }, [radius])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const handleWheel = (event: WheelEvent) => {
      // Biarkan pinch-to-zoom / Ctrl+wheel bekerja seperti biasa.
      if (event.ctrlKey || !event.cancelable || drag.current) return
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX : event.deltaY
      if (raw === 0) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1
      moveTo(target.current - clamp(raw * unit, -180, 180) * WHEEL_SENSITIVITY)
      clearWheelTimer()
      wheelTimer.current = setTimeout(snap, 180)
    }
    // Listener native non-passive: hanya area orbit yang menangkap scroll.
    stage.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      stage.removeEventListener('wheel', handleWheel)
      clearWheelTimer()
    }
  }, [clearWheelTimer, moveTo, snap])

  useAnimationFrame((_, delta) => {
    if (!isHydrated || !inView.current || document.hidden) return
    const dt = Math.min(delta, 50)
    const canFloat = !paused && !reducedMotion && !drag.current
    const canAutoRotate = canFloat && !hovered.current && !focused.current &&
      performance.now() >= resumeAt.current

    // Hover menghentikan orbit, sementara produk tetap melayang perlahan.
    if (canFloat) clock.set(clock.get() + dt)
    if (canAutoRotate) {
      target.current -= AUTO_SPEED * dt / 1000
    }

    const current = rotation.get()
    const distance = target.current - current
    const next = reducedMotion || Math.abs(distance) < 0.001
      ? target.current
      : current + distance * (1 - Math.exp(-dt / (drag.current ? 45 : 100)))
    // MotionValue memperbarui transform tanpa render ulang React setiap frame.
    if (next !== current) rotation.set(next)
    const nextIndex = wrapIndex(Math.round(-next / STEP))
    if (nextIndex !== activeRef.current) {
      activeRef.current = nextIndex
      setActiveIndex(nextIndex)
    }
  })

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || drag.current) return
    clearWheelTimer()
    suppressClick.current = false
    target.current = rotation.get()
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startAngle: rotation.get(),
      moved: false,
    }
  }

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.moved) {
      if (Math.abs(dx) < 6 || Math.abs(dy) > Math.abs(dx)) return
      state.moved = true
      suppressClick.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    moveTo(state.startAngle + dx * DRAG_SENSITIVITY)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (state.moved) snap()
  }

  const activeProduct = wheelProducts[activeIndex] ?? wheelProducts[0]
  if (!activeProduct) return null

  return (
    <div ref={hostRef} className="w-full min-w-0">
      <section
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={titleId}
        onMouseEnter={() => { hovered.current = true }}
        onMouseLeave={() => { hovered.current = false }}
        onFocusCapture={() => { focused.current = true }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            focused.current = false
          }
        }}
        style={{
          width: 'var(--carousel-viewport-width, 100%)',
          marginLeft: 'var(--carousel-viewport-offset, 0px)',
          maxWidth: 'none',
        }}
        className="relative isolate overflow-hidden bg-[#edf5ef] py-12 sm:py-16"
      >
        <div
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse at 50% 42%, #dbece0 0%, #e7f2eb 52%, #edf5ef 100%)' }}
          className="pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26A21]">
            Interactive Showcase
          </span>
          <h2 id={titleId} className="mt-2 font-display text-3xl font-bold text-[#003F35] sm:text-4xl">
            Katalog Riset Peptide Premium
          </h2>
          <p id={hintId} className="mt-3 text-sm text-[#003F35]/60">
            Scroll atau geser untuk memutar · Klik produk untuk memilih
          </p>
        </div>

        {/* Jangan menaruh overflow-hidden pada stage ini: kedalaman 3D perlu dipertahankan. */}
        <div
          ref={stageRef}
          role="group"
          aria-label="Orbit produk"
          aria-describedby={hintId}
          tabIndex={0}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={(event) => {
            // Sentuhan mula-mula ditangkap tombol produk, lalu dipindah ke stage.
            // Abaikan lost capture dari tombol agar swipe tidak berhenti di tengah.
            if (event.target === event.currentTarget) endDrag(event)
          }}
          onPointerLeave={(event) => {
            if (drag.current && !drag.current.moved) endDrag(event)
          }}
          onClickCapture={(event) => {
            if (suppressClick.current && event.detail !== 0) {
              event.preventDefault()
              event.stopPropagation()
              suppressClick.current = false
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault()
              stepBy(event.key === 'ArrowRight' ? 1 : -1)
            }
          }}
          style={{
            perspective: '1400px',
            transformStyle: 'preserve-3d',
            touchAction: 'pan-y pinch-zoom',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          className="relative mx-auto mt-3 h-[410px] w-full max-w-6xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003F35]/40 sm:h-[490px]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-[10%] h-16 w-4/5 rounded-[50%] border border-[#003F35]/10 bg-[#003F35]/[0.025] sm:bottom-6 sm:h-24"
          />
          {isHydrated ? wheelProducts.map((product, index) => (
            <OrbitProduct
              key={product.id}
              product={product}
              index={index}
              rotation={rotation}
              radius={radius}
              clock={clock}
              active={activeIndex === index}
              onSelect={() => selectProduct(index)}
            />
          )) : (
            // Tampilan statis yang identik di server dan render pertama browser.
            // Tinggi stage tetap, jadi pergantian ke orbit tidak menggeser halaman.
            <div className="pointer-events-none absolute left-1/2 top-1/2 w-[156px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[210px] lg:w-[230px]">
              <div className="relative h-[190px] w-full sm:h-[240px] lg:h-[260px]">
                <Image
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  fill
                  priority
                  sizes="(max-width: 639px) 210px, (max-width: 1023px) 280px, 310px"
                  className="object-contain drop-shadow-[0_18px_18px_rgba(0,63,53,0.16)]"
                />
              </div>
              <h3 className="mt-4 min-h-[40px] text-sm font-semibold leading-5 text-[#003F35] sm:text-base">
                {activeProduct.name}
              </h3>
              <p className="mt-1 text-xs font-medium text-[#003F35]/70 sm:text-sm">
                {activeProduct.price}
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5 px-4 text-center">
          <div className="flex max-w-full items-center gap-2 sm:gap-5">
            <button type="button" onClick={() => stepBy(-1)} aria-label="Produk sebelumnya" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#003F35]/15 bg-white text-xl text-[#003F35] transition-colors hover:bg-[#003F35] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F26A21] sm:h-11 sm:w-11">
              ←
            </button>
            <div className="flex min-w-0 flex-wrap items-center justify-center" role="group" aria-label="Pilih produk">
              {wheelProducts.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => selectProduct(index)}
                  aria-label={`Pilih ${product.name}`}
                  aria-pressed={activeIndex === index}
                  className="flex h-11 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F26A21] sm:w-8"
                >
                  <span className={`h-2 rounded-full transition-all ${activeIndex === index ? 'w-6 bg-[#F26A21]' : 'w-2 bg-[#003F35]/25'}`} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => stepBy(1)} aria-label="Produk berikutnya" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#003F35]/15 bg-white text-xl text-[#003F35] transition-colors hover:bg-[#003F35] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F26A21] sm:h-11 sm:w-11">
              →
            </button>
          </div>

          <div className="w-full min-h-[172px] sm:min-h-[148px]" aria-live={paused || reducedMotion ? 'polite' : 'off'} aria-atomic="true">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#003F35]/60">
              {activeProduct.category}
            </p>
            <p className="mt-1 text-xl font-semibold text-[#003F35]">{activeProduct.name}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#003F35]/65">
              {activeProduct.tagline}
            </p>
            <p className="mt-3 text-sm text-[#003F35]/70">
              {activeProduct.showStartingPrice && (
                <span className="mb-1 block text-xs">mulai dari</span>
              )}
              <span className="font-semibold text-[#003F35]">{activeProduct.price}</span>
              {' / '}{activeProduct.variantLabel}
            </p>
          </div>

          <Link
            href={activeProduct.href}
            className="inline-flex min-h-11 max-w-full items-center justify-center rounded-full bg-[#003F35] px-7 py-3 text-center font-semibold leading-5 text-white transition-colors hover:bg-[#005447] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26A21]"
          >
            {copy.viewProduct} {activeProduct.name} →
          </Link>

          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              className="min-h-11 rounded px-3 text-xs font-medium text-[#003F35]/65 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F26A21]"
            >
              {paused ? 'Lanjutkan putaran otomatis' : 'Jeda putaran otomatis'}
            </button>
          )}
        </div>

      </section>
    </div>
  )
}

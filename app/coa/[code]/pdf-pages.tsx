'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from 'pdfjs-dist'

export function PdfPages({
  src,
  title,
}: {
  src: string
  title: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)

  const [status, setStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading')

  const [detail, setDetail] = useState('')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let revision = 0
    let lastSize = ''

    let timer: ReturnType<typeof setTimeout> | undefined
    let loadingTask: PDFDocumentLoadingTask | undefined
    let pdf: PDFDocumentProxy | undefined
    let activeRender: RenderTask | undefined

    const controller = new AbortController()

    setStatus('loading')
    setDetail('')
    host.replaceChildren()

    function fail(error: unknown) {
      if (disposed) return

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown PDF error'

      const safeMessage = message
        .replaceAll(src, '[document]')
        .replaceAll(window.location.href, '[page]')

      console.error(`[Regen COA] ${title}: ${safeMessage}`)

      setDetail(safeMessage)
      setStatus('error')
    }

    async function renderPages() {
      const width = Math.floor(
        host!.getBoundingClientRect().width,
      )

      if (disposed || !pdf || width < 1) return

      const ratio = Math.min(
        Math.max(window.devicePixelRatio || 1, 2),
        3,
      )

      const size = `${width}:${ratio}`
      if (size === lastSize) return

      lastSize = size
      const current = ++revision

      activeRender?.cancel()
      setStatus('loading')

      try {
        const pages = document.createDocumentFragment()

        for (let number = 1; number <= pdf.numPages; number++) {
          const page = await pdf.getPage(number)

          if (disposed || current !== revision) return

          const original = page.getViewport({ scale: 1 })

          const viewport = page.getViewport({
            scale: width / original.width,
          })

          const density = Math.min(
            ratio,
            Math.sqrt(
              12_000_000 / (viewport.width * viewport.height),
            ),
          )

          const canvas = document.createElement('canvas')

          canvas.width = Math.ceil(viewport.width * density)
          canvas.height = Math.ceil(viewport.height * density)

          canvas.style.cssText =
            'display:block;width:100%;height:auto;background:white'

          canvas.setAttribute('role', 'img')
          canvas.setAttribute(
            'aria-label',
            `${title} — page ${number}`,
          )

          canvas.textContent = `${title} — page ${number}`

          const context = canvas.getContext('2d')
          if (!context) {
            throw new Error('Canvas is unavailable')
          }

          const task = page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform: [density, 0, 0, density, 0, 0],
          })

          activeRender = task
          await task.promise

          if (activeRender === task) {
            activeRender = undefined
          }

          if (disposed || current !== revision) return

          pages.append(canvas)
        }

        host!.replaceChildren(pages)
        setStatus('ready')
      } catch (error) {
        if (disposed || current !== revision) return

        if (
          error instanceof Error &&
          error.name === 'RenderingCancelledException'
        ) {
          return
        }

        lastSize = ''
        fail(error)
      }
    }

    function queueRender() {
      clearTimeout(timer)

      timer = setTimeout(() => {
        void renderPages()
      }, 150)
    }

    const observer = new ResizeObserver(queueRender)

    observer.observe(host)
    window.addEventListener('resize', queueRender)

    async function load() {
  try {
    const response = await fetch(src, {
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'same-origin',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
    })

    if (!response.ok) {
      throw new Error(
        `PDF HTTP ${response.status}: check the PDF filename and the protected route.`,
      )
    }

    const data = new Uint8Array(
      await response.arrayBuffer(),
    )

    const header = new TextDecoder().decode(
      data.subarray(0, 1024),
    )

    if (!header.includes('%PDF-')) {
      throw new Error(
        'The document URL did not return a PDF. Check route.ts and the file extension.',
      )
    }

    if (disposed) return

    const pdfjs = await import('pdfjs-dist')

    if (disposed) return

    // Worker diproses oleh Next.js dari paket yang terpasang.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()

    // Aset pendukung tetap disiapkan oleh skrip sebelumnya.
    const assets = `/coa-pdf-assets/${pdfjs.version}/`

    loadingTask = pdfjs.getDocument({
      data,
      cMapUrl: `${assets}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${assets}standard_fonts/`,
      wasmUrl: `${assets}wasm/`,
      iccUrl: `${assets}iccs/`,
    })

    pdf = await loadingTask.promise

    if (disposed) return

    await renderPages()
  } catch (error) {
    fail(error)
  }
}

    void load()

    return () => {
      disposed = true
      revision++

      controller.abort()
      clearTimeout(timer)

      observer.disconnect()
      window.removeEventListener('resize', queueRender)

      activeRender?.cancel()
      void loadingTask?.destroy().catch(() => {})

      host.replaceChildren()
    }
  }, [src, title])

  return (
    <div
      className="coa-pdf-pages"
      role="group"
      aria-label={title}
      aria-busy={status === 'loading'}
    >
      {status === 'loading' && (
        <p className="coa-pdf-status" role="status">
          Loading document…
        </p>
      )}

      {status === 'error' && (
        <div className="coa-pdf-status" role="alert">
          <p>This document could not be displayed.</p>

          {process.env.NODE_ENV !== 'production' && (
            <p
              style={{
                marginTop: 8,
                overflowWrap: 'anywhere',
              }}
            >
              {detail}
            </p>
          )}
        </div>
      )}

      <div ref={hostRef} className="coa-pdf-canvases" />

      <noscript>
        Enable JavaScript to view this document.
      </noscript>
    </div>
  )
}
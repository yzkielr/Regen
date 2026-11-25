 'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Adds a subtle, premium smooth-scroll / inertia effect.
 * Lightweight and performant: respects reduced-motion and disables
 * on touch devices (native momentum scrolling is better there).
 */
export function SmoothScroll() {
  useEffect(() => {
    // Respect users who prefer reduced motion.
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Keep native momentum on touch for best mobile performance.
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    })

    // Smoothly scroll to in-page anchor links.
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null
      if (!target) return
      const id = target.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -72 })
    }
    document.addEventListener('click', handleAnchorClick)

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}

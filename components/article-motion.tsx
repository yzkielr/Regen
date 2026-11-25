'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function ArticleMotion({ children }: { children: ReactNode }) {
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!main.current || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('article-in-view')
          observer.unobserve(entry.target)
        }
      }
    })
    const sections = main.current.querySelectorAll(
      '.journal-row, .article-prose > *, .article-contact, .article-related',
    )
    for (const section of sections) {
      if (!section.classList.contains('article-in-view')) observer.observe(section)
    }
    return () => observer.disconnect()
  }, [children])

  return <main ref={main} className="article-shell">{children}</main>
}

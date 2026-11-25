'use client'
import { useState } from 'react'
import { safeUrl } from '@/lib/articles'
export function ArticleAvatar({ name, url = '' }: { name: string; url?: string }) {
  const [failed, setFailed] = useState('')
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'R'
  return (
    <span className="article-avatar" aria-hidden="true">
      {safeUrl(url) && failed !== url ? <img src={url} alt="" onError={() => setFailed(url)} /> : initials}
    </span>
  )
}

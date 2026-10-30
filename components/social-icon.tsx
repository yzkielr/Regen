import type { SITE_SOCIAL_PROFILES } from '@/lib/site-seo'

type Platform = (typeof SITE_SOCIAL_PROFILES)[number]['name']

// Brand glyphs from Simple Icons; source license is alongside the SVG assets.
const icons: Record<Platform, { file: string; background: string }> = {
  Instagram: { file: 'instagram', background: 'bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4]' },
  Facebook: { file: 'facebook', background: 'bg-white' },
  TikTok: { file: 'tiktok', background: 'bg-[#111111] ring-1 ring-white/20' },
}

export function SocialIcon({ platform }: { platform: Platform }) {
  const icon = icons[platform]
  return (
    <span aria-hidden="true" className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${icon.background}`}>
      <img src={`/brand/social/${icon.file}.svg`} alt="" width={20} height={20} className="size-5" />
    </span>
  )
}

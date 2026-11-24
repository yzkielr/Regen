import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'default' | 'light'
  withTagline?: boolean
}

export function Logo({
  className,
  variant = 'default',
  withTagline = false,
}: LogoProps) {
  const taglineColor =
    variant === 'light'
      ? 'text-primary-foreground/70'
      : 'text-muted-foreground'

  return (
    <span className={cn('inline-flex flex-col leading-none', className)}>
      <span className="relative inline-flex w-fit items-center">
        <Image
          src="/brand/regen-logo-green-small.webp"
          alt="Regen"
          width={84}
          height={36}
          loading="eager"
          className={cn(
            'h-9 w-auto object-contain',
            variant === 'light' && 'brightness-0 invert',
          )}
        />
        {variant === 'light' && (
          <Image
            src="/brand/regen-logo-green-small.webp"
            alt=""
            aria-hidden="true"
            width={84}
            height={36}
            loading="eager"
            className="pointer-events-none absolute inset-0 h-9 w-auto object-contain [clip-path:circle(1.85%_at_55.9%_59.62%)]"
          />
        )}
      </span>
      {withTagline && (
        <span
          className={cn(
            'mt-1 text-[0.6rem] font-medium uppercase tracking-[0.18em]',
            taglineColor,
          )}
        >
          Regenerative Science. Clearly Delivered.
        </span>
      )}
    </span>
  )
}

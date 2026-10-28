'use client'

import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { useRegion } from '@/components/region-provider'
import { buildConsultationWhatsAppUrl, SUPPORT_COPY } from '@/lib/support-copy'

type ConsultationButtonProps = Omit<ComponentProps<typeof Button>, 'render'> & {
  /** When set, the consultation message is personalized for this product. */
  productName?: string
}

/**
 * A link that opens a consultation draft in WhatsApp.
 * Can be dropped into server components since it is a client component.
 */
export function ConsultationButton({
  children,
  productName,
  ...props
}: ConsultationButtonProps) {
  const { language, region } = useRegion()
  return (
    <Button
      {...props}
      render={<a href={buildConsultationWhatsAppUrl({ language, region, productName })} target="_blank" rel="noopener noreferrer" />}
    >
      {children ?? SUPPORT_COPY[language].consultation.start}
    </Button>
  )
}

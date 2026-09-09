'use client'

import { motion, type Variants } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ConsultationButton } from '@/components/consultation-button'
import { useRegion } from '@/components/region-provider'
import { TrustCarousel } from '@/components/trust-carousel'
import { homeCopy } from '@/lib/home-copy'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Hero() {
  const { region, language } = useRegion()
  const copy = homeCopy[language]

  return (
    <>
      <section
        id="beranda"
        className="relative min-h-screen w-full overflow-hidden text-foreground flex flex-col justify-between pt-24 sm:pt-28"
      >
        {/* Background hanya menutupi hero, berakhir sebelum banner. */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image
            src="/hero-image.jpg"
            alt="Regen Desktop Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center w-full h-full opacity-100"
          />
        </div>

        {/* Content Container */}
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 w-full relative flex-1 flex flex-col justify-between z-10 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto py-8 sm:py-12">

            {/* KOLOM KIRI: Statistik & CTA Katalog */}
            <motion.div
              className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left gap-6 bg-black/25 backdrop-blur-md border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-accent"
                  />
                  Regen / {region.nativeName}
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-0.5 text-[11px] font-medium text-white">
                  {region.currency} · {region.languageName}
                </span>
              </motion.div>

              <div className="flex items-center gap-6 sm:gap-8">
                <motion.div variants={item} className="space-y-0.5">
                  <p className="text-3xl sm:text-4xl font-bold text-white font-display">98%</p>
                  <p className="text-[11px] text-white/80 uppercase tracking-wider font-semibold">
                    Customer Satisfaction
                  </p>
                </motion.div>

                <div className="w-[1px] h-10 bg-white/20" />

                <motion.div variants={item} className="space-y-0.5">
                  <p className="text-3xl sm:text-4xl font-bold text-white font-display">
                    200+
                  </p>
                  <p className="text-[11px] text-white/80 uppercase tracking-wider font-semibold">
                    Peptide Research
                  </p>
                </motion.div>
              </div>

              <motion.div variants={item} className="pt-2 w-full sm:w-auto">
                <Button
                  render={<a href="#katalog" />}
                  size="lg"
                  className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 shadow-xl shadow-accent/25 flex items-center justify-center gap-2 font-semibold"
                >
                  {copy.viewCatalog}
                  <span className="text-lg">→</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* KOLOM TENGAH: Ruang untuk gambar produk */}
            <div className="hidden md:block md:col-span-4 pointer-events-none" />

            {/* KOLOM KANAN: Deskripsi & Konsultasi */}
            <motion.div
              className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left gap-5 bg-black/25 backdrop-blur-md border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  Regen Precision
                </h2>
                <p className="text-sm font-semibold text-accent mt-0.5">
                  Your partner in peptide innovation.
                </p>
              </motion.div>

              <motion.p
                variants={item}
                className="text-sm text-white/90 leading-relaxed drop-shadow"
              >
                {copy.hero.body}
              </motion.p>

              <motion.div variants={item} className="pt-2 w-full sm:w-auto">
                <ConsultationButton
                  size="default"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-full px-6"
                >
                  {copy.freeConsultation}
                </ConsultationButton>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Banner mengikuti tinggi hero, tepat setelah background dan sebelum wheel. */}
      <div className="relative z-20 w-full">
        <TrustCarousel />
      </div>
    </>
  )
}

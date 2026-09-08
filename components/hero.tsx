'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ConsultationButton } from '@/components/consultation-button'
import { useRegion } from '@/components/region-provider'
import { TrustCarousel } from '@/components/trust-carousel'
import { HOME_TAGLINE, homeCopy } from '@/lib/home-copy'
import { Logo } from './logo'

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
    <section
      id="beranda"
      className="relative min-h-[92vh] overflow-hidden text-foreground flex flex-col justify-between pt-20 sm:pt-28"
      style={{
        background:
          'linear-gradient(to bottom, #f4f8f6 0%, #eef5f3 50%, #e2ede8 100%)',
      }}
    >
      {/* Background Watermark Logo - disesuaikan ukurannya di HP */}
      <div className="pointer-events-none absolute top-28 sm:top-34 left-1/2 z-0 w-full -translate-x-1/2 select-none flex justify-center overflow-hidden scale-[1.8] sm:scale-[3.5] lg:scale-[5] opacity-30 sm:opacity-100">
        <Logo />
      </div>

      {/* Video Pengganti Canvas 3D - Disesuaikan agar proporsional di HP */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="w-full h-full max-w-5xl mx-auto flex items-center justify-center p-2 sm:p-4">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-h-[45vh] sm:max-h-none sm:h-full object-contain sm:object-cover opacity-80 sm:opacity-90 rounded-2xl"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="pointer-events-none mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative flex-1 flex flex-col justify-between z-10">
        <div className="relative z-30 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto py-4 sm:py-6 lg:py-10">
          {/* Kolom Kiri */}
          <motion.div
            className="pointer-events-auto md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 z-10 bg-white/40 sm:bg-transparent p-4 sm:p-0 rounded-2xl backdrop-blur-sm sm:backdrop-blur-none border border-white/40 sm:border-none shadow-sm sm:shadow-none"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-accent"
                />
                Regen / {region.nativeName}
              </span>

              <span className="rounded-full border border-primary/15 bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-primary/80">
                {region.currency} · {region.languageName}
              </span>
            </motion.div>

            <motion.div variants={item} className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-primary font-display">98%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Customer Satisfaction
              </p>
            </motion.div>

            <motion.div variants={item} className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-primary font-display">
                200+
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Peptide Research Library
              </p>
            </motion.div>

            <motion.div variants={item} className="pt-1 sm:pt-2">
              <Button
                render={<a href="#katalog" />}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-7 shadow-lg shadow-accent/20 flex items-center gap-2 font-semibold"
              >
                {copy.viewCatalog}
                <span className="text-lg">→</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Kolom Tengah (Kosong di Desktop untuk Ruang Video) */}
          <div aria-hidden="true" className="hidden md:block md:col-span-4" />

          {/* Kolom Kanan */}
          <motion.div
            className="pointer-events-auto md:col-span-4 flex flex-col items-center md:items-end text-center md:text-right gap-3 sm:gap-4 z-10 bg-white/40 sm:bg-transparent p-4 sm:p-0 rounded-2xl backdrop-blur-sm sm:backdrop-blur-none border border-white/40 sm:border-none shadow-sm sm:shadow-none"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <h2 className="text-xl sm:text-2xl font-bold text-primary font-display">
                Regen Precision
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-accent mt-0.5">
                Your partner in peptide innovation.
              </p>
            </motion.div>

            <motion.p
              variants={item}
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs"
            >
              {copy.hero.body}
            </motion.p>

            <motion.div variants={item} className="pt-1 sm:pt-2">
              <ConsultationButton
                size="default"
                variant="outline"
                className="border-primary/25 bg-white/60 text-primary hover:bg-primary/10 rounded-full"
              >
                {copy.freeConsultation}
              </ConsultationButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Card Bawah */}
        <motion.div
          className="pointer-events-auto relative z-10 rounded-t-[2rem] sm:rounded-t-[2.5rem] bg-primary text-primary-foreground p-6 sm:p-12 shadow-2xl mt-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-8">
              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                {HOME_TAGLINE.headline}{' '}
                <span className="text-accent">{HOME_TAGLINE.accent}</span>
              </h1>
            </div>

            <div className="md:col-span-4 flex flex-wrap md:flex-col items-center md:items-end justify-center md:justify-start gap-2 sm:gap-1.5 text-xs sm:text-sm text-primary-foreground/80 font-medium tracking-wide">
              <span>Research Grade</span>
              <span className="hidden md:inline">•</span>
              <span>HPLC Tested</span>
              <span className="hidden md:inline">•</span>
              <span>Endotoxin Tested</span>
            </div>
          </div>
        </motion.div>
      </div>

      <TrustCarousel />
    </section>
  )
}
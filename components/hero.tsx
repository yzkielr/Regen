"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConsultationButton } from "@/components/consultation-button"
import { useRegion } from "@/components/region-provider"
import { TrustCarousel } from "@/components/trust-carousel"
import { HOME_TAGLINE, homeCopy } from "@/lib/home-copy"
// Impor logo resmi dari folder ui/
import { Logo } from "./logo"

// Variabel konfigurasi animasi stagger (kemunculan bertahap)
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

// Variabel konfigurasi animasi pergeseran halus dari bawah ke atas
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function Hero() {
  // Mengambil state region (negara/mata uang) & bahasa aktif
  const { region, language } = useRegion()
  const copy = homeCopy[language]

  return (
    <section
      id="beranda"
      className="relative min-h-[92vh] overflow-hidden text-foreground flex flex-col justify-between pt-24 sm:pt-28"
      style={{
        // Latar belakang gradien lembut netral (tanpa rona oranye)
        background:
          "linear-gradient(to bottom, #f4f8f6 0%, #eef5f3 50%, #e2ede8 100%)",
      }}
    >
      {/* ==================== 1. WATERMARK LOGO REGEN RESMI (ATAS TENGAH) ==================== */}
      {/* Menggunakan komponen <Logo /> langsung agar bentuk & font persis seperti di header kiri atas */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 z-0 opacity-100 select-none w-full flex justify-center overflow-hidden scale-[3] sm:scale-[4] lg:scale-[5]">
        <Logo />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10 flex-1 flex flex-col justify-between">
        
        {/* ==================== 2. KONTEN UTAMA (3 KOLOM) ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto py-6 lg:py-10">
          
          {/* ----- KOLOM KIRI: STATISTIK, REGION & TOMBOL CTA ----- */}
          <motion.div
            className="md:col-span-4 flex flex-col items-start gap-5 z-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Tag Wilayah / Region Badge */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                Regen / {region.nativeName}
              </span>
              <span className="rounded-full border border-primary/15 bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-primary/80">
                {region.currency} · {region.languageName}
              </span>
            </motion.div>

            {/* Metrik Statistik */}
            <motion.div variants={item} className="space-y-0.5">
              <p className="text-3xl font-bold text-primary font-display">98%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Customer Satisfaction
              </p>
            </motion.div>

            <motion.div variants={item} className="space-y-0.5">
              <p className="text-3xl font-bold text-primary font-display">200+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Peptide Research Library
              </p>
            </motion.div>

            {/* Tombol Lihat Katalog */}
            <motion.div variants={item} className="pt-2">
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


          {/* ----- KOLOM TENGAH: VIDEO PRODUK  ----- */}
          <motion.div
            className="md:col-span-4 relative flex items-center justify-center z-20 my-6 md:my-0"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="relative flex items-center justify-center">
              {/* Note: Div bayangan/glow oranye telah dihapus agar tampilan produk bersih */}

              {/* Video/Foto Produk Pen */}
              <video
                className="h-auto max-h-[380px] sm:max-h-[460px] lg:max-h-[520px] w-auto object-contain mix-blend-multiply drop-shadow-xl"
                autoPlay
                muted
                loop
                playsInline
                poster="/hero-pen-poster.jpg"
                aria-hidden="true"
              >
                <source src="/hero-pen.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>


          {/* ----- KOLOM KANAN: SLOGAN BRAND & DESKRIPSI ----- */}
          <motion.div
            className="md:col-span-4 flex flex-col items-start md:items-end text-left md:text-right gap-4 z-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Slogan Brand */}
            <motion.div variants={item}>
              <h2 className="text-2xl font-bold text-primary font-display">Regen Precision</h2>
              <p className="text-sm font-semibold text-accent mt-0.5">
                Your partner in peptide innovation.
              </p>
            </motion.div>

            {/* Deskripsi Singkat */}
            <motion.p
              variants={item}
              className="text-sm text-muted-foreground leading-relaxed max-w-xs"
            >
              {copy.hero.body}
            </motion.p>

            {/* Tombol Konsultasi Gratis */}
            <motion.div variants={item} className="pt-2">
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


        {/* ==================== 3. BANNER BAWAH BERLEKUK (ROUNDED CARD) ==================== */}
        <motion.div
          className="relative z-10 rounded-t-[2.5rem] bg-primary text-primary-foreground p-8 sm:p-12 shadow-2xl mt-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Headline Utama */}
            <div className="md:col-span-8">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                {HOME_TAGLINE.headline} <span className="text-accent">{HOME_TAGLINE.accent}</span>
              </h1>
            </div>

            {/* Daftar Fitur Singkat */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end gap-1.5 text-sm text-primary-foreground/80 font-medium tracking-wide">
              <span>Research Grade</span>
              <span>HPLC Tested</span>
              <span>Endotoxin Tested</span>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Strip Karusel Sertifikasi / Trust Carousel */}
      <TrustCarousel />
    </section>
  )
}
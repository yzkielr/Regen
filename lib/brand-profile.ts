import type { Language } from './regions'

type BrandProfile = {
  link: string
  eyebrow: string
  title: string
  description: string
  introduction: string
  catalogTitle: string
  catalogText: string
  informationTitle: string
  informationText: string
  supportTitle: string
  supportText: string
  contactTitle: string
  websiteLabel: string
  emailLabel: string
  socialTitle: string
  socialText: string
  catalogLink: string
  researchOnly: string
}

export const BRAND_PROFILE: Record<Language, BrandProfile> = {
  id: {
    link: 'Tentang Regen Longevity Lab',
    eyebrow: 'Kenali Regen',
    title: 'Tentang Regen Longevity Lab',
    description: 'Kenali Regen Longevity Lab (Regen Longevity), katalog peptida riset, pilihan paket, kontak, dan akun media sosial resminya.',
    introduction: 'Regen Longevity Lab, juga dikenal sebagai Regen Longevity atau Regen, menyediakan katalog peptida riset dan informasi produk melalui regenlongevitylab.com. Halaman ini memperkenalkan brand Regen dan saluran resmi untuk menghubungi tim kami.',
    catalogTitle: 'Katalog dan pilihan paket',
    catalogText: 'Katalog Regen memuat informasi produk, kekuatan atau varian, serta harga paket yang tersedia. Pilihan Basic Package, Cartridge Package, dan Pen Package dapat berbeda untuk setiap produk.',
    informationTitle: 'Informasi sebelum memesan',
    informationText: 'Tim Regen dapat membantu mengecek informasi produk, ketersediaan, isi paket, dan dokumen Certificate of Analysis (COA) yang terkait dengan pesanan. Konfirmasikan detail produk dan kemasan sebelum memesan.',
    supportTitle: 'Katalog untuk region Anda',
    supportText: 'Anda sedang melihat informasi untuk {region}, dengan harga katalog dalam {currency}. Pilih region yang sesuai untuk melihat bahasa dan mata uangnya. Tim kami akan mengonfirmasi ketersediaan, opsi pengiriman, dan harga akhir.',
    contactTitle: 'Kontak resmi Regen',
    websiteLabel: 'Website resmi',
    emailLabel: 'Email tim Regen',
    socialTitle: 'Ikuti akun resmi Regen',
    socialText: 'Temukan Regen Longevity Lab di Instagram, Facebook, dan TikTok melalui tautan resmi berikut.',
    catalogLink: 'Lihat katalog Regen',
    researchOnly: 'Katalog ini ditujukan untuk penggunaan dan aktivitas penelitian laboratorium. Informasi produk bukan pengganti saran medis.',
  },
  en: {
    link: 'About Regen Longevity Lab',
    eyebrow: 'Get to know Regen',
    title: 'About Regen Longevity Lab',
    description: 'Learn about Regen Longevity Lab (Regen Longevity), its research peptide catalog, package options, contact details and official social profiles.',
    introduction: 'Regen Longevity Lab, also known as Regen Longevity or Regen, provides a research peptide catalog and product information at regenlongevitylab.com. This page introduces the Regen brand and the official ways to reach our team.',
    catalogTitle: 'Catalog and package options',
    catalogText: 'The Regen catalog includes product information, strengths or variants, and available package prices. Basic Package, Cartridge Package and Pen Package options may vary by product.',
    informationTitle: 'Information before you order',
    informationText: 'Our team can help confirm product information, availability, package contents and Certificate of Analysis (COA) documents associated with an order. Confirm product and packaging details before ordering.',
    supportTitle: 'A catalog for your region',
    supportText: 'You are viewing information for {region}, with catalog prices in {currency}. Select your region for its language and currency. Our team confirms availability, shipping options and final pricing.',
    contactTitle: 'Contact Regen',
    websiteLabel: 'Official website',
    emailLabel: 'Email the Regen team',
    socialTitle: 'Follow the official Regen profiles',
    socialText: 'Find Regen Longevity Lab on Instagram, Facebook and TikTok through these official links.',
    catalogLink: 'Explore the Regen catalog',
    researchOnly: 'This catalog is intended for laboratory research use and activity. Product information is not a substitute for medical advice.',
  },
  ms: {
    link: 'Tentang Regen Longevity Lab',
    eyebrow: 'Kenali Regen',
    title: 'Tentang Regen Longevity Lab',
    description: 'Kenali Regen Longevity Lab (Regen Longevity), katalog peptida penyelidikan, pilihan pakej, maklumat hubungan dan profil media sosial rasminya.',
    introduction: 'Regen Longevity Lab, juga dikenali sebagai Regen Longevity atau Regen, menyediakan katalog peptida penyelidikan dan maklumat produk melalui regenlongevitylab.com. Halaman ini memperkenalkan jenama Regen dan saluran rasmi untuk menghubungi pasukan kami.',
    catalogTitle: 'Katalog dan pilihan pakej',
    catalogText: 'Katalog Regen mengandungi maklumat produk, kekuatan atau varian, serta harga pakej yang tersedia. Pilihan Basic Package, Cartridge Package dan Pen Package mungkin berbeza mengikut produk.',
    informationTitle: 'Maklumat sebelum membuat pesanan',
    informationText: 'Pasukan Regen boleh membantu menyemak maklumat produk, ketersediaan, kandungan pakej dan dokumen Certificate of Analysis (COA) yang berkaitan dengan pesanan. Sahkan butiran produk dan pembungkusan sebelum membuat pesanan.',
    supportTitle: 'Katalog untuk region anda',
    supportText: 'Anda sedang melihat maklumat untuk {region}, dengan harga katalog dalam {currency}. Pilih region anda untuk bahasa dan mata wang yang sesuai. Pasukan kami akan mengesahkan ketersediaan, pilihan penghantaran dan harga akhir.',
    contactTitle: 'Hubungi Regen',
    websiteLabel: 'Laman web rasmi',
    emailLabel: 'Email pasukan Regen',
    socialTitle: 'Ikuti profil rasmi Regen',
    socialText: 'Temui Regen Longevity Lab di Instagram, Facebook dan TikTok melalui pautan rasmi berikut.',
    catalogLink: 'Lihat katalog Regen',
    researchOnly: 'Katalog ini bertujuan untuk kegunaan dan aktiviti penyelidikan makmal. Maklumat produk bukan pengganti nasihat perubatan.',
  },
}

import type { Product, VariantId } from './products'
import type { Language } from './regions'

type LocalizedProductCopy = Pick<Product, 'category' | 'tagline' | 'description'>

const translations: Record<'ms' | 'id', Record<string, LocalizedProductCopy>> = {
  ms: {
    retatrutide: {
      category: 'LEMAK & KOMPOSISI BADAN',
      tagline: 'Agonis tiga reseptor yang dikaji untuk komposisi badan.',
      description: 'Retatrutide ialah agonis tiga reseptor (GLP-1 / GIP / glukagon). Dalam kajian, sebatian ini diteliti untuk melihat kesannya terhadap keseimbangan tenaga, isyarat selera makan dan komposisi badan. Format katalog ini ialah cartridge 10mg untuk kajian makmal.',
    },
    'cjc-1295-ipamorelin': {
      category: 'OTOT & PERTUMBUHAN',
      tagline: 'Blend analog GHRH dan ghrelin untuk kajian hormon pertumbuhan.',
      description: 'Blend CJC-1295 (No DAC), analog GHRH, dan Ipamorelin, sebatian yang merangsang pelepasan hormon pertumbuhan secara selektif. Kedua-duanya dikaji bersama untuk pola pelepasan hormon pertumbuhan yang berdenyut, recovery dan sokongan tisu tanpa lemak.',
    },
    klow80: {
      category: 'RECOVERY BLEND',
      tagline: 'Blend beberapa peptides yang dikaji untuk pembaikan dan recovery.',
      description: 'KLOW80 ialah blend beberapa peptides yang menggabungkan sebatian regeneratif dan reparatif. Blend ini dikaji untuk pembaikan tisu, kualiti kulit dan sokongan recovery secara keseluruhan dalam satu format.',
    },
    'mots-c': {
      category: 'METABOLISME & LONGEVITY',
      tagline: 'Peptide daripada mitokondria untuk kajian metabolisme.',
      description: 'MOTS-C ialah peptide yang berasal daripada mitokondria. Ia dikaji untuk peranannya dalam pengawalan metabolisme, sensitiviti insulin dan tenaga sel. Sebatian ini semakin mendapat perhatian dalam kajian metabolisme dan longevity.',
    },
    'nad-plus': {
      category: 'REGENERASI & LONGEVITY',
      tagline: 'Koenzim penting untuk tenaga dan pembaikan sel.',
      description: 'NAD+ (nicotinamide adenine dinucleotide) ialah koenzim yang penting untuk penghasilan tenaga sel dan pembaikan DNA. Ia banyak dikaji dalam bidang regenerasi dan longevity. Format katalog ini mengandungi 500mg.',
    },
    tesamorelin: {
      category: 'LEMAK & PERTUMBUHAN',
      tagline: 'Analog GHRH yang dikaji untuk lemak viseral dan hormon pertumbuhan.',
      description: 'Tesamorelin ialah analog GHRH yang distabilkan. Ia dikaji untuk melihat kesannya terhadap pengurangan lemak viseral dan rangsangan hormon pertumbuhan. Format katalog ini ialah cartridge 10mg untuk kajian makmal.',
    },
    'bpc-157': {
      category: 'RECOVERY & PEMBAIKAN TISU',
      tagline: 'Body protection compound untuk kajian pembaikan tisu.',
      description: 'BPC-157 ialah peptide gastrik stabil yang terdiri daripada 15 asid amino. Dalam kajian praklinikal, ia banyak diteliti untuk pembaikan tisu, recovery tendon dan ligamen serta kesihatan usus.',
    },
    'ghk-cu': {
      category: 'KULIT & REGENERASI',
      tagline: 'Copper peptide yang dikaji untuk kulit dan regenerasi.',
      description: 'GHK-Cu ialah copper tripeptide semula jadi. Ia dikaji untuk regenerasi kulit, sintesis kolagen dan penyembuhan luka. Format katalog ini mengandungi 100mg, khusus untuk kajian makmal.',
    },
  },
  id: {
    retatrutide: {
      category: 'LEMAK & KOMPOSISI TUBUH',
      tagline: 'Agonis tiga reseptor yang diteliti untuk komposisi tubuh.',
      description: 'Retatrutide adalah agonis tiga reseptor (GLP-1 / GIP / glukagon). Dalam riset, senyawa ini dipelajari untuk melihat pengaruhnya pada keseimbangan energi, sinyal nafsu makan, dan komposisi tubuh. Pilihan 10mg di katalog ini khusus untuk riset laboratorium.',
    },
    'cjc-1295-ipamorelin': {
      category: 'OTOT & PERTUMBUHAN',
      tagline: 'Blend analog GHRH dan ghrelin untuk riset hormon pertumbuhan.',
      description: 'Blend CJC-1295 (No DAC), analog GHRH, dan Ipamorelin, senyawa yang secara selektif memicu pelepasan hormon pertumbuhan. Keduanya diteliti bersama untuk pelepasan hormon pertumbuhan secara pulsatif, recovery, dan dukungan jaringan tanpa lemak.',
    },
    klow80: {
      category: 'RECOVERY BLEND',
      tagline: 'Blend beberapa peptides yang diteliti untuk perbaikan dan recovery.',
      description: 'KLOW80 adalah blend beberapa peptides yang menggabungkan senyawa regeneratif dan reparatif. Dalam riset, blend ini dipelajari untuk perbaikan jaringan, kualitas kulit, dan dukungan recovery secara keseluruhan dalam satu format.',
    },
    'mots-c': {
      category: 'METABOLISME & LONGEVITY',
      tagline: 'Peptide dari mitokondria untuk riset metabolisme.',
      description: 'MOTS-C adalah peptide yang berasal dari mitokondria. Dalam riset, senyawa ini dipelajari untuk perannya dalam pengaturan metabolisme, sensitivitas insulin, dan energi sel. MOTS-C semakin menarik perhatian dalam riset metabolisme dan longevity.',
    },
    'nad-plus': {
      category: 'REGENERASI & LONGEVITY',
      tagline: 'Koenzim penting untuk energi dan perbaikan sel.',
      description: 'NAD+ (nicotinamide adenine dinucleotide) adalah koenzim yang penting untuk produksi energi sel dan perbaikan DNA. Senyawa ini banyak dipelajari dalam riset regenerasi dan longevity. Format katalog ini mengandung 500mg.',
    },
    tesamorelin: {
      category: 'LEMAK & PERTUMBUHAN',
      tagline: 'Analog GHRH yang diteliti untuk lemak viseral dan hormon pertumbuhan.',
      description: 'Tesamorelin adalah analog GHRH yang dibuat lebih stabil. Dalam riset, senyawa ini dipelajari untuk melihat pengaruhnya terhadap pengurangan lemak viseral dan rangsangan hormon pertumbuhan. Pilihan 10mg di katalog ini khusus untuk riset laboratorium.',
    },
    'bpc-157': {
      category: 'RECOVERY & PERBAIKAN JARINGAN',
      tagline: 'Body protection compound untuk riset perbaikan jaringan.',
      description: 'BPC-157 adalah peptide lambung stabil yang terdiri dari 15 asam amino. Dalam riset praklinis, senyawa ini banyak diteliti untuk perbaikan jaringan, recovery tendon dan ligamen, serta kesehatan usus.',
    },
    'ghk-cu': {
      category: 'KULIT & REGENERASI',
      tagline: 'Copper peptide yang diteliti untuk kulit dan regenerasi.',
      description: 'GHK-Cu adalah copper tripeptide yang terdapat secara alami. Dalam riset, senyawa ini dipelajari untuk regenerasi kulit, sintesis kolagen, dan penyembuhan luka. Format katalog ini mengandung 100mg, khusus untuk riset laboratorium.',
    },
  },
}

export function getProductCopy(product: Product, language: Language): Product {
  if (language === 'en') return product
  return {
    ...product,
    ...translations[language][product.slug],
    dosage: product.dosage.replaceAll('clicks', 'klik'),
  }
}

type CatalogCopy = {
  heading: string
  intro: string
  talkToTeam: string
  viewProduct: string
  startingPrice: string
  backToCatalog: string
  labelReference: string
  selectFormat: string
  orderConsultation: string
  viewImage: string
  researchOnly: string
  priceNotice: string
  photoNotice: string
  basicPhotoNotice?: string
  recommendedHeading: string
  recommendedBody: string
  usps: [string, string, string, string]
  variants: Record<VariantId, { label: string; note: string; alt: string }>
  imageAlt: string
  formatsHeading: string
  formatsBody: string
  formats: Record<VariantId, { name: string; body: string }>
}

export const catalogCopy: Record<Language, CatalogCopy> = {
  en: {
    heading: 'Explore our research peptide catalog',
    intro: 'Talk to our team about your research and the catalog options for your selected region.',
    talkToTeam: 'Talk to Our Team',
    viewProduct: 'View Product',
    startingPrice: 'from',
    backToCatalog: 'Back to catalog',
    labelReference: 'Cartridge label reference (not usage guidance)',
    selectFormat: 'Choose your format',
    orderConsultation: 'Product & Pricing Inquiry',
    viewImage: 'View',
    researchOnly: 'For laboratory research only. Not for human consumption or therapeutic use.',
    priceNotice: 'Prices are shown in your selected currency where a catalog price is available. Ask our team to confirm final pricing, availability, shipping and any applicable taxes for your region.',
    photoNotice: 'Catalog images are illustrative. Confirm product and packaging details with our team.',
    recommendedHeading: 'More from the catalog.',
    recommendedBody: 'Explore other research peptides in the Regen catalog.',
    usps: ['Laboratory documentation', 'Batch-specific COA', 'Ask about shipping', 'Research support'],
    variants: {
      basic: { label: 'Basic Package', note: 'Ask our team to confirm Basic Package contents and product details.', alt: 'Basic Package packaging' },
      cartridge: { label: 'Cartridge Package', note: 'Refill cartridge for the compatible Regen Pen device.', alt: 'Cartridge Package packaging' },
      pen: { label: 'Pen Package', note: 'Pre-filled pen package for laboratory research.', alt: 'Pen Package packaging' },
    },
    imageAlt: 'research cartridge',
    formatsHeading: 'One quality standard. Three research formats.',
    formatsBody: 'Explore Basic Package, Cartridge Package and Pen Package. Our team can confirm package details, format compatibility and availability for your research.',
    formats: {
      basic: { name: 'Basic Package', body: 'A Basic Package option for laboratory research. Ask our team to confirm package contents and product details.' },
      cartridge: { name: 'Cartridge Package', body: 'A refill cartridge for research setups using the compatible Regen Pen device. Ask our team to confirm compatibility and product details.' },
      pen: { name: 'Pen Package', body: 'A pre-filled pen format for laboratory research. Ask our team about package contents, handling information and regional availability.' },
    },
  },
  ms: {
    heading: 'Kenali peptides untuk kajian anda',
    intro: 'Beritahu kami tentang kajian anda. Kami boleh bantu anda semak pilihan produk untuk region anda.',
    talkToTeam: 'Tanya Kami',
    viewProduct: 'Lihat Produk',
    startingPrice: 'bermula dari',
    backToCatalog: 'Kembali ke katalog',
    labelReference: 'Info pada label cartridge (bukan panduan penggunaan)',
    selectFormat: 'Pilih format anda',
    orderConsultation: 'Tanya Produk & Harga',
    viewImage: 'Lihat',
    researchOnly: 'Untuk kajian makmal sahaja. Bukan untuk digunakan pada manusia atau sebagai rawatan.',
    priceNotice: 'Harga katalog yang tersedia dipaparkan dalam mata wang pilihan anda. Sebelum buat pesanan, semak harga akhir, produk yang tersedia, penghantaran dan cukai untuk region anda dengan kami.',
    photoNotice: 'Gambar katalog hanya sebagai rujukan. Semak detail produk dan packaging dengan kami sebelum membuat pesanan.',
    recommendedHeading: 'Lihat juga produk lain.',
    recommendedBody: 'Kenali peptides lain untuk kajian makmal dalam katalog Regen.',
    usps: ['Dokumen makmal', 'COA per batch', 'Tanya tentang penghantaran', 'Support untuk kajian'],
    variants: {
      basic: { label: 'Basic Package', note: 'Tanya kami tentang isi Basic Package dan detail produknya.', alt: 'gambar Basic Package' },
      cartridge: { label: 'Cartridge Package', note: 'Cartridge refill untuk Regen Pen yang serasi.', alt: 'gambar Cartridge Package' },
      pen: { label: 'Pen Package', note: 'Pen yang sudah diisi, untuk kajian makmal sahaja.', alt: 'gambar Pen Package' },
    },
    imageAlt: 'cartridge untuk kajian makmal',
    formatsHeading: 'Kualiti yang sama. Tiga format untuk kajian.',
    formatsBody: 'Pilih Basic Package, Cartridge Package atau Pen Package. Kami boleh bantu semak isi pakej, kesesuaian peranti dan produk yang tersedia untuk kajian anda.',
    formats: {
      basic: { name: 'Basic Package', body: 'Pilihan Basic Package untuk kajian makmal. Semak isi pakej dan detail produk dengan team kami.' },
      cartridge: { name: 'Cartridge Package', body: 'Cartridge refill untuk kajian makmal menggunakan Regen Pen yang serasi. Hubungi kami untuk semak kesesuaian peranti dan detail produk.' },
      pen: { name: 'Pen Package', body: 'Pen yang sudah diisi untuk kajian makmal. Tanya kami tentang isi pakej, cara pengendalian dan produk yang tersedia di region anda.' },
    },
  },
  id: {
    heading: 'Kenali peptides untuk kebutuhan risetmu',
    intro: 'Ceritakan kebutuhan risetmu ke kami. Kami bantu kamu cek pilihan produk untuk region kamu.',
    talkToTeam: 'Tanya Tim Kami',
    viewProduct: 'Lihat Produk',
    startingPrice: 'mulai dari',
    backToCatalog: 'Kembali ke katalog',
    labelReference: 'Info pada label cartridge (bukan petunjuk penggunaan)',
    selectFormat: 'Pilih format yang kamu butuhkan',
    orderConsultation: 'Tanya Produk & Harga',
    viewImage: 'Lihat',
    researchOnly: 'Khusus penggunaan riset laboratorium.',
    priceNotice: 'Harga katalog yang tersedia ditampilkan dalam mata uang pilihanmu. Cek dulu dengan kami untuk harga akhir, produk yang bisa dipesan, pengiriman, dan pajak di region kamu.',
    photoNotice: 'Foto katalog hanya sebagai gambaran. Cek detail produk dan kemasan dengan kami sebelum memesan.',
    basicPhotoNotice: 'Foto Basic Package sebagai gambaran. Konfirmasi isi paket dan detail produk dengan tim kami.',
    recommendedHeading: 'Cek juga produk lainnya.',
    recommendedBody: 'Lihat peptides lainnya untuk riset laboratorium di katalog Regen.',
    usps: ['Dokumen lab', 'COA per batch', 'Tanya soal pengiriman', 'Support riset'],
    variants: {
      basic: { label: 'Basic Package', note: 'Tanyakan isi Basic Package dan detail produknya ke tim kami.', alt: 'foto Basic Package' },
      cartridge: { label: 'Cartridge Package', note: 'Cartridge refill untuk Regen Pen yang kompatibel.', alt: 'foto Cartridge Package' },
      pen: { label: 'Pen Package', note: 'Pen yang sudah terisi, untuk keperluan riset anda', alt: 'foto Pen Package' },
    },
    imageAlt: 'cartridge untuk riset laboratorium',
    formatsHeading: 'Standar kualitas yang sama. Tiga pilihan untuk riset.',
    formatsBody: 'Pilih Basic Package, Cartridge Package, atau Pen Package. Tim kami bantu cek detail paket, kecocokan perangkat, dan ketersediaannya untuk kebutuhan risetmu.',
    formats: {
      basic: { name: 'Basic Package', body: 'Pilihan Basic Package untuk kebutuhan riset laboratorium. Isi paket dan detail produknya perlu kamu konfirmasi ke tim kami.' },
      cartridge: { name: 'Cartridge Package', body: 'Cartridge refill untuk riset dengan perangkat Regen Pen yang kompatibel. Kami bantu cek kecocokan perangkat dan detail produknya.' },
      pen: { name: 'Pen Package', body: 'Pen yang sudah terisi untuk riset laboratorium. Tanyakan isi paket, cara penanganan, dan ketersediaan di region kamu ke tim kami.' },
    },
  },
}

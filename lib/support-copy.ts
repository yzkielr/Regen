import type { Language, Region } from '@/lib/regions'

// Keep consultation requests on the contact already used by the site.
export const CONTACT_EMAIL = 'contact@regenlongevitylab.com'

interface SupportCopy {
  consultation: {
    eyebrow: string
    title: string
    description: string
    points: string[]
    cardTitle: string
    cardDescription: string
    start: string
    privacy: string
  }
  modal: {
    close: string
    title: string
    sendTitle: string
    description: string
    sendDescription: string
    scamTitle: string
    scamDescription: string
    introduction: string
    regionLabel: string
    phone: string
    countryCode: string
    phonePlaceholder: string
    phoneHint: string
    euDialHint: string
    agreement: string
    contact: string
    continue: string
    to: string
    subject: string
    message: string
    gmail: string
    emailApp: string
    copyAddress: string
    copyMessage: string
    copied: string
    copyFailed: string
    back: string
    draftNotice: string
  }
  email: {
    subject: string
    greeting: string
    general: string
    product: string
    region: string
    currency: string
    phone: string
    availability: string
  }
  faq: {
    eyebrow: string
    title: string
    items: { q: string; a: string }[]
    disclaimerTitle: string
    disclaimer: string
  }
  footer: {
    title: string
    description: string
    start: string
    email: string
    tagline: string
    about: string
    products: string
    catalog: string
    cartridge: string
    pen: string
    company: string
    quality: string
    shipping: string
    faq: string
    contact: string
    regionShipping: string
    copyright: string
    researchOnly: string
  }
}

export const SUPPORT_COPY: Record<Language, SupportCopy> = {
  en: {
    consultation: {
      eyebrow: 'Free consultation',
      title: 'Talk to our team before you order',
      description: 'Tell us about your research needs. Our team can help you explore the catalog and confirm product information, regional pricing, and availability. No cost, no obligation to buy.',
      points: ['Product and format information', 'Regional pricing and shipping enquiries', 'Support before and after your order'],
      cardTitle: 'Contact the Regen team',
      cardDescription: 'Prepare an email for our team with your selected region and currency. You can review the message before sending it from Gmail or your email app.',
      start: 'Start free consultation',
      privacy: 'Nothing is sent until you choose to send the email.',
    },
    modal: {
      close: 'Close consultation',
      title: 'Consultation request',
      sendTitle: 'Review your request',
      description: 'Read the information below before continuing.',
      sendDescription: 'Choose how you would like to email Regen.',
      scamTitle: 'Be alert to scams',
      scamDescription: 'Use the contact address shown here to contact Regen. Check the recipient before sharing personal details or making a payment.',
      introduction: 'Our team can help with product information, pricing, and availability for your selected region. This enquiry does not place an order.',
      regionLabel: 'Selected region and currency',
      phone: 'Phone number for your consultation',
      countryCode: 'Country calling code',
      phonePlaceholder: 'Your phone number',
      phoneHint: 'Choose your own country code, even if it differs from your selected region. Enter 6 or more digits, up to 15 including the country code.',
      euDialHint: 'The EU has multiple country codes. Germany (+49) is selected initially; please choose your country.',
      agreement: 'I confirm that I am at least 18 years old and understand that these details will be included in the email I choose to send to Regen.',
      contact: 'Consultation email address',
      continue: 'Continue',
      to: 'To',
      subject: 'Subject',
      message: 'Message',
      gmail: 'Compose in Gmail',
      emailApp: 'Open my email app',
      copyAddress: 'Copy address',
      copyMessage: 'Copy message',
      copied: 'Copied',
      copyFailed: 'Copying is unavailable. Please select and copy the text above.',
      back: 'Back',
      draftNotice: 'These options open a draft only. Review it and send it yourself when ready.',
    },
    email: {
      subject: 'Consultation request',
      greeting: 'Hello Regen,',
      general: 'I would like to start a consultation.',
      product: 'I would like more information about {product}.',
      region: 'Selected region',
      currency: 'Preferred currency',
      phone: 'My contact number',
      availability: 'Please confirm product availability, pricing, and shipping options for my region.',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Frequently asked questions',
      items: [
        { q: 'What are peptides and how do they work?', a: 'Peptides are short chains of amino acids that can act as biological signals. Researchers study them to better understand processes such as recovery, metabolism, and ageing. Research findings do not establish that every peptide is safe or effective for personal use.' },
        { q: 'What product information can Regen provide?', a: 'Ask our team for available product specifications, batch documentation, Certificates of Analysis (COAs), and handling information for the product you are considering.' },
        { q: 'Are peptides safe to use?', a: 'A purity test or COA does not establish safety for human use. Safety depends on the compound, its intended use, and individual circumstances. Seek advice from a qualified healthcare professional rather than using this website as medical guidance.' },
        { q: 'Does choosing a region mean every product is approved there?', a: 'No. Selecting a region changes the website language and currency display; it is not a statement of regulatory approval. Product classifications, import rules, and availability vary. Confirm the details for the specific product and destination before ordering.' },
        { q: 'How do I choose a product?', a: 'Start by reviewing the product information and the purpose of your research. Our team can explain the catalog and available formats. Personal medical decisions should be discussed with a qualified healthcare professional.' },
        { q: 'How soon can results be expected?', a: 'Outcomes and timelines vary by compound and research context. The website does not guarantee an outcome or a timeline for results.' },
        { q: 'How do I read a Certificate of Analysis (COA)?', a: 'A COA typically identifies the compound, batch, purity, testing method, date, and laboratory results. Match the batch number on the product to the document. A COA describes testing; it is not proof of medical approval or suitability for personal use.' },
        { q: 'Can peptides be combined?', a: 'Do not assume that research into individual compounds establishes the safety of combining them. This website does not provide personalised combination or dosing advice.' },
        { q: 'What is the difference between a pen and a pre-filled cartridge?', a: 'The pen format includes the pen device. A pre-filled cartridge is intended for use with a compatible device. Check the product specifications and compatibility with our team before ordering.' },
        { q: 'Who is this catalog intended for?', a: 'The catalog provides information about laboratory research products for adults. It does not provide medical advice or establish that a product is suitable for human use.' },
        { q: 'What if there is a problem with my order?', a: 'Contact our team promptly with your order details and any relevant photos or batch information. Return eligibility and the next steps will be confirmed for your product and region.' },
        { q: 'Can I order from my selected region?', a: 'You are viewing Regen for {region}, with {currency} as the selected currency. Our team will confirm product availability, final pricing, and shipping options for your destination before you order.' },
      ],
      disclaimerTitle: 'Disclaimer',
      disclaimer: 'This content is provided for educational and informational purposes regarding peptide research compounds. It is not intended to diagnose, treat, cure, or prevent any disease and is not a substitute for professional medical advice. Consult a qualified healthcare professional about medical decisions. Selecting a region does not imply product approval or guaranteed delivery.',
    },
    footer: {
      title: 'Questions before you order? Start with a free consultation.',
      description: 'Our team can help you explore the catalog and confirm the information relevant to your region.',
      start: 'Talk to our team',
      email: 'Email us',
      tagline: 'European research-grade peptides, delivered with precision.',
      about: 'Explore research peptides, product documentation, and support from the Regen team.',
      products: 'Products',
      catalog: 'Peptide catalog',
      cartridge: 'Pre-filled cartridges',
      pen: 'Pen format',
      company: 'Company',
      quality: 'Quality',
      shipping: 'Shipping',
      faq: 'FAQ',
      contact: 'Contact',
      regionShipping: 'Availability and shipping to {region} are confirmed by our team.',
      copyright: 'All rights reserved.',
      researchOnly: 'For laboratory research only.',
    },
  },
  ms: {
    consultation: {
      eyebrow: 'Konsultasi percuma',
      title: 'Ada soalan sebelum order? Tanya kami dulu.',
      description: 'Kongsikan apa yang anda perlukan untuk kajian. Kami boleh bantu semak pilihan dalam katalog, info produk, harga dan produk yang tersedia untuk region anda. Konsultasi ini percuma, tanpa perlu membeli.',
      points: ['Info produk dan pilihan format', 'Harga dan pilihan penghantaran untuk region anda', 'Customer support sebelum dan selepas order'],
      cardTitle: 'Hubungi pasukan Regen',
      cardDescription: 'Kami sediakan draf email dengan region dan mata wang yang anda pilih. Anda boleh semak dan hantar melalui Gmail atau aplikasi email anda.',
      start: 'Mulakan konsultasi percuma',
      privacy: 'Tiada apa-apa dihantar sehingga anda sendiri menghantar email.',
    },
    modal: {
      close: 'Tutup konsultasi',
      title: 'Konsultasi dengan Regen',
      sendTitle: 'Semak mesej anda',
      description: 'Sebelum teruskan, baca maklumat ini dulu.',
      sendDescription: 'Pilih cara untuk menghantar email kepada kami.',
      scamTitle: 'Hati-hati dengan penipuan',
      scamDescription: 'Untuk menghubungi Regen, gunakan email yang tertera di sini. Semak alamat penerima sebelum berkongsi maklumat peribadi atau membuat bayaran.',
      introduction: 'Kami boleh bantu semak info produk, harga dan pilihan yang tersedia untuk region anda. Borang ini untuk pertanyaan sahaja, bukan untuk membuat pesanan.',
      regionLabel: 'Region dan mata wang pilihan',
      phone: 'Nombor telefon anda',
      countryCode: 'Kod negara',
      phonePlaceholder: 'Masukkan nombor telefon',
      phoneHint: 'Pilih kod negara mengikut nombor telefon anda, bukan semestinya region yang dipilih. Masukkan sekurang-kurangnya 6 digit, maksimum 15 digit termasuk kod negara.',
      euDialHint: 'Negara-negara EU mempunyai kod telefon berbeza. Pilihan awal ialah Jerman (+49); tukar mengikut negara nombor telefon anda.',
      agreement: 'Saya berumur sekurang-kurangnya 18 tahun dan faham bahawa butiran ini akan dimasukkan dalam email yang saya pilih untuk dihantar kepada Regen.',
      contact: 'Email untuk konsultasi',
      continue: 'Teruskan',
      to: 'Kepada',
      subject: 'Subjek',
      message: 'Mesej',
      gmail: 'Tulis dalam Gmail',
      emailApp: 'Buka aplikasi email',
      copyAddress: 'Salin alamat',
      copyMessage: 'Salin mesej',
      copied: 'Disalin',
      copyFailed: 'Teks tak dapat disalin secara automatik. Anda boleh pilih dan salin teks di atas.',
      back: 'Kembali',
      draftNotice: 'Ini hanya membuka draf email. Anda boleh semak dulu, kemudian hantar sendiri apabila bersedia.',
    },
    email: {
      subject: 'Konsultasi Regen',
      greeting: 'Hi Regen,',
      general: 'Saya nak dapatkan maklumat sebelum membuat pesanan.',
      product: 'Saya nak tahu lebih lanjut tentang {product}.',
      region: 'Region pilihan',
      currency: 'Mata wang pilihan',
      phone: 'Nombor telefon saya',
      availability: 'Boleh bantu semak produk yang tersedia, harga dan pilihan penghantaran untuk region saya?',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Soalan yang biasa ditanya',
      items: [
        { q: 'Apa itu peptides, dan bagaimana ia berfungsi?', a: 'Peptides ialah rantaian pendek asid amino yang boleh bertindak sebagai isyarat biologi. Ia dikaji untuk memahami proses seperti recovery, metabolisme dan penuaan. Hasil kajian ini tidak bermaksud semua peptides selamat atau berkesan untuk kegunaan peribadi.' },
        { q: 'Info produk apa yang boleh saya minta?', a: 'Anda boleh minta spesifikasi produk, dokumen batch, COA (Certificate of Analysis) dan panduan pengendalian yang tersedia untuk produk yang anda cari.' },
        { q: 'Peptides selamat digunakan?', a: 'Ujian ketulenan atau COA sahaja tidak membuktikan produk selamat untuk kegunaan manusia. Keselamatan bergantung pada sebatian, tujuan penggunaan dan keadaan individu. Rujuk doktor atau profesional kesihatan yang berkelayakan untuk keputusan perubatan, bukan jadikan website ini panduan perubatan.' },
        { q: 'Kalau pilih sesuatu region, adakah produknya sudah diluluskan di sana?', a: 'Tidak secara automatik. Pilihan region hanya menukar bahasa dan mata wang pada website, bukan menunjukkan produk mendapat kelulusan pihak berkuasa. Kategori produk, peraturan import dan produk yang tersedia boleh berbeza mengikut negara. Sahkan butiran produk dan destinasi penghantaran sebelum order.' },
        { q: 'Bagaimana nak pilih produk?', a: 'Mulakan dengan tujuan kajian anda, kemudian semak info produk. Kami boleh terangkan pilihan dan format dalam katalog. Untuk keputusan perubatan peribadi, rujuk doktor atau profesional kesihatan yang berkelayakan.' },
        { q: 'Bila boleh nampak hasilnya?', a: 'Hasil dan tempohnya bergantung pada sebatian serta konteks kajian. Kami tidak menjanjikan hasil atau tempoh tertentu.' },
        { q: 'Bagaimana nak baca COA?', a: 'COA biasanya menyenaraikan nama sebatian, nombor batch, tahap ketulenan, kaedah dan tarikh ujian, serta keputusan makmal. Padankan nombor batch pada produk dengan dokumennya. COA menerangkan hasil ujian, bukan bukti kelulusan perubatan atau kesesuaian untuk kegunaan peribadi.' },
        { q: 'Boleh gabungkan beberapa peptides?', a: 'Kajian terhadap satu sebatian tidak bermaksud ia selamat digabungkan dengan sebatian lain. Website ini tidak memberikan cadangan gabungan atau dos untuk keperluan peribadi.' },
        { q: 'Apa beza Pen dan pre-filled cartridge?', a: 'Pilihan Pen sudah termasuk peranti pen. Pre-filled cartridge digunakan dengan peranti yang serasi. Sebelum order, semak spesifikasi dan kesesuaiannya dengan pasukan kami.' },
        { q: 'Katalog ini untuk siapa?', a: 'Katalog ini untuk orang dewasa yang mencari info produk penyelidikan makmal. Isinya bukan nasihat perubatan dan tidak menyatakan bahawa produk sesuai untuk kegunaan manusia.' },
        { q: 'Ada masalah dengan pesanan?', a: 'Hubungi kami segera dengan butiran pesanan, gambar atau nombor batch yang berkaitan. Kami akan sahkan sama ada produk boleh dipulangkan dan langkah seterusnya mengikut produk serta region anda.' },
        { q: 'Boleh order dari region yang dipilih?', a: 'Anda sedang melihat Regen untuk {region} dengan mata wang {currency}. Sebelum anda order, kami akan sahkan produk yang tersedia, harga akhir dan pilihan penghantaran ke destinasi anda.' },
      ],
      disclaimerTitle: 'Disclaimer',
      disclaimer: 'Maklumat di website ini hanya untuk pendidikan dan rujukan tentang sebatian peptides dalam kajian. Ia bukan untuk mendiagnosis, merawat, menyembuhkan atau mencegah penyakit, dan bukan pengganti nasihat perubatan profesional. Untuk keputusan perubatan, rujuk doktor atau profesional kesihatan yang berkelayakan. Memilih region tidak bermakna produk mendapat kelulusan rasmi atau penghantaran dijamin.',
    },
    footer: {
      title: 'Masih ada soalan? Dapatkan konsultasi percuma sebelum order.',
      description: 'Kami boleh bantu anda fahami pilihan dalam katalog dan semak info produk untuk region anda.',
      start: 'Tanya pasukan Regen',
      email: 'Hantar email',
      tagline: 'European research-grade peptides, delivered with precision.',
      about: 'Info research peptides, dokumen produk dan bantuan daripada pasukan Regen.',
      products: 'Produk',
      catalog: 'Katalog peptides',
      cartridge: 'Pre-filled cartridge',
      pen: 'Pen',
      company: 'Tentang Regen',
      quality: 'Kualiti',
      shipping: 'Penghantaran',
      faq: 'FAQ',
      contact: 'Hubungi kami',
      regionShipping: 'Untuk region {region}, pasukan kami akan sahkan produk yang tersedia dan pilihan penghantarannya.',
      copyright: 'Hak cipta terpelihara.',
      researchOnly: 'Untuk kegunaan dan aktiviti penyelidikan makmal sahaja',
    },
  },
  id: {
    consultation: {
      eyebrow: 'Konsultasi gratis',
      title: 'Mau tanya sebelum order? Kami siap bantu.',
      description: 'Ceritakan kebutuhan riset kamu. Kami bisa bantu cek pilihan di katalog, info produk, harga, dan produk yang tersedia untuk region kamu. Konsultasinya gratis, tanpa harus membeli.',
      points: ['Info produk dan pilihan format', 'Harga dan opsi pengiriman untuk region kamu', 'Customer support sebelum dan setelah order'],
      cardTitle: 'Hubungi tim Regen',
      cardDescription: 'Kami siapkan draf email dengan region dan mata uang pilihan kamu. Cek dulu isinya, lalu kirim lewat Gmail atau aplikasi email kamu.',
      start: 'Mulai konsultasi gratis',
      privacy: 'Tidak ada yang dikirim sampai kamu sendiri mengirim email.',
    },
    modal: {
      close: 'Tutup konsultasi',
      title: 'Konsultasi dengan Regen',
      sendTitle: 'Cek pesan kamu',
      description: 'Baca info ini dulu sebelum lanjut, ya.',
      sendDescription: 'Pilih cara mengirim email ke tim kami.',
      scamTitle: 'Hati-hati penipuan',
      scamDescription: 'Untuk menghubungi Regen, gunakan email yang tertera di sini. Cek alamat penerima sebelum berbagi data pribadi atau melakukan pembayaran.',
      introduction: 'Kami bisa bantu cek info produk, harga, dan pilihan yang tersedia untuk region kamu. Form ini hanya untuk bertanya, belum membuat pesanan.',
      regionLabel: 'Region dan mata uang pilihan',
      phone: 'Nomor telepon kamu',
      countryCode: 'Kode negara',
      phonePlaceholder: 'Masukkan nomor telepon',
      phoneHint: 'Pilih kode negara sesuai nomor telepon kamu, meskipun berbeda dari region yang dipilih. Masukkan minimal 6 digit, maksimal 15 digit termasuk kode negara.',
      euDialHint: 'Negara-negara EU punya kode telepon yang berbeda. Pilihan awalnya Jerman (+49); ganti sesuai negara nomor telepon kamu.',
      agreement: 'Saya berusia minimal 18 tahun dan memahami bahwa data ini akan disertakan dalam email yang saya pilih untuk dikirim ke Regen.',
      contact: 'Email untuk konsultasi',
      continue: 'Lanjutkan',
      to: 'Kepada',
      subject: 'Subjek',
      message: 'Pesan',
      gmail: 'Tulis di Gmail',
      emailApp: 'Buka aplikasi email',
      copyAddress: 'Salin alamat',
      copyMessage: 'Salin pesan',
      copied: 'Disalin',
      copyFailed: 'Teks belum bisa disalin otomatis. Kamu bisa memilih dan menyalin teks di atas.',
      back: 'Kembali',
      draftNotice: 'Ini hanya membuka draf email. Cek dulu isinya, lalu kirim sendiri saat kamu sudah siap.',
    },
    email: {
      subject: 'Konsultasi Regen',
      greeting: 'Halo tim Regen,',
      general: 'Saya mau konsultasi sebelum order.',
      product: 'Saya mau tahu lebih lanjut tentang {product}.',
      region: 'Region pilihan',
      currency: 'Mata uang pilihan',
      phone: 'Nomor telepon saya',
      availability: 'Bisa bantu cek produk yang tersedia, harga, dan opsi pengiriman untuk region saya?',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Yang sering ditanyakan',
      items: [
        { q: 'Peptides itu apa, dan bagaimana cara kerjanya?', a: 'Peptides adalah rantai pendek asam amino yang bisa berperan sebagai sinyal biologis. Peptides dipelajari dalam riset tentang recovery, metabolisme, dan penuaan. Hasil riset ini tidak berarti semua peptides aman atau efektif untuk penggunaan pribadi.' },
        { q: 'Bisa minta info produk apa saja?', a: 'Kamu bisa minta spesifikasi produk, dokumen batch, COA (Certificate of A nalysis), dan petunjuk penanganan yang tersedia untuk produk yang kamu cari.' },
        { q: 'Peptides aman digunakan?', a: 'Hasil uji kemurnian atau COA saja tidak membuktikan bahwa produk aman digunakan pada manusia. Keamanannya bergantung pada senyawa, tujuan penggunaan, dan kondisi masing-masing orang. Untuk keputusan medis, konsultasikan dengan dokter atau tenaga medis yang berwenang. Jangan jadikan website ini sebagai panduan medis.' },
        { q: 'Kalau memilih region, berarti produknya sudah disetujui di sana?', a: 'Tidak otomatis. Pengaturan ini hanya mengubah bahasa dan tampilan mata uang, bukan menunjukkan izin atau persetujuan regulator. Kategori produk, aturan impor, dan produk yang tersedia bisa berbeda di tiap negara. Cek dulu detail produk dan tujuan pengiriman sebelum order.' },
        { q: 'Bingung pilih produk?', a: 'Mulai dari tujuan riset kamu, lalu cek info produknya. Kami bisa bantu menjelaskan pilihan dan format di katalog. Untuk kebutuhan atau keputusan medis pribadi, bicarakan dengan dokter atau tenaga medis yang berwenang.' },
        { q: 'Berapa lama sampai terlihat hasilnya?', a: 'Hasil dan waktunya bergantung pada senyawa serta konteks riset. Kami tidak menjanjikan hasil atau waktu tertentu.' },
        { q: 'Bagaimana cara membaca COA?', a: 'COA biasanya memuat nama senyawa, nomor batch, tingkat kemurnian, metode dan tanggal pengujian, serta hasil lab. Cocokkan nomor batch di produk dengan dokumennya. COA menjelaskan hasil pengujian, bukan bukti persetujuan medis atau kecocokan untuk penggunaan pribadi.' },
        { q: 'Boleh menggabungkan beberapa peptides?', a: 'Riset atas satu senyawa tidak otomatis membuktikan bahwa senyawa itu aman digabung dengan yang lain. Website ini tidak memberi saran kombinasi atau dosis untuk kebutuhan pribadi.' },
        { q: 'Apa bedanya Pen dan pre-filled cartridge?', a: 'Pilihan Pen sudah termasuk perangkat pen. Pre-filled cartridge dipakai dengan perangkat yang kompatibel. Sebelum order, cek dulu spesifikasi dan kecocokannya dengan tim kami.' },
        { q: 'Katalog ini untuk siapa?', a: 'Katalog ini ditujukan untuk orang dewasa yang mencari info produk riset laboratorium. Isinya bukan saran medis dan tidak menyatakan bahwa produk cocok digunakan pada manusia.' },
        { q: 'Ada masalah dengan pesanan?', a: 'Segera hubungi kami dengan detail pesanan, foto, atau nomor batch yang relevan. Kami akan mengonfirmasi apakah produk bisa dikembalikan dan langkah selanjutnya sesuai produk serta region kamu.' },
        { q: 'Bisa order dari region yang dipilih?', a: 'Kamu sedang membuka Regen untuk {region} dengan mata uang {currency}. Sebelum kamu order, kami akan mengonfirmasi produk yang tersedia, harga akhir, dan opsi pengiriman ke tujuan kamu.' },
      ],
      disclaimerTitle: 'Disclaimer',
      disclaimer: 'Informasi di website ini hanya untuk edukasi seputar senyawa peptides dalam riset. Bukan untuk mendiagnosis, mengobati, menyembuhkan, atau mencegah penyakit, dan tidak menggantikan saran medis profesional. Untuk keputusan medis, konsultasikan dengan dokter atau tenaga medis yang berwenang. Memilih region tidak berarti produk mendapat persetujuan resmi atau pengiriman dijamin.',
    },
    footer: {
      title: 'Mau tanya dulu sebelum order? Konsultasi gratis dengan kami.',
      description: 'Kami bisa bantu kamu memahami pilihan di katalog dan mengecek info produk untuk region kamu.',
      start: 'Tanya tim Regen',
      email: 'Kirim email',
      tagline: 'European research-grade peptides, delivered with precision.',
      about: 'Info peptides untuk riset, dokumen produk, dan bantuan dari tim Regen.',
      products: 'Produk',
      catalog: 'Katalog peptides',
      cartridge: 'Pre-filled cartridge',
      pen: 'Pen',
      company: 'Tentang Regen',
      quality: 'Kualitas',
      shipping: 'Pengiriman',
      faq: 'FAQ',
      contact: 'Hubungi kami',
      regionShipping: 'Untuk region {region}, tim kami akan mengonfirmasi produk yang tersedia dan opsi pengirimannya.',
      copyright: 'Hak cipta dilindungi.',
      researchOnly: 'Hanya untuk penggunaan dan aktivitas penelitian laboratorium.',
    },
  },
}

export function regionalSupportText(text: string, region: Region): string {
  return text.replaceAll('{region}', region.name).replaceAll('{currency}', region.currency)
}

/** Builds an email draft only. Sending remains an explicit visitor action. */
export function buildConsultationEmail({
  language,
  region,
  productName,
  countryDial,
  phoneNumber,
}: {
  language: Language
  region: Region
  productName: string | null
  countryDial: string
  phoneNumber: string
}) {
  const copy = SUPPORT_COPY[language].email
  const subject = `${copy.subject} — ${region.name} (${region.currency})${productName ? ` — ${productName}` : ''}`
  const body = [
    copy.greeting,
    '',
    productName ? copy.product.replace('{product}', productName) : copy.general,
    '',
    `${copy.region}: ${region.name}`,
    `${copy.currency}: ${region.currency}`,
    `${copy.phone}: ${countryDial} ${phoneNumber.trim()}`,
    '',
    copy.availability,
  ].join('\n')

  return {
    subject,
    body,
    mailtoUrl: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  }
}

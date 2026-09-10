import type { Language } from '@/lib/regions'

type HomeCopy = {
  viewCatalog: string
  freeConsultation: string
  startConsultation: string
  hero: {
    trusted: string
    body: string
    settings: string
    trust: readonly [string, string, string]
  }
  principles: {
    heading: string
    items: readonly { title: string; body: string }[]
  }
  testimonial: {
    heading: string
    intro: string
    disclaimer: string
    quote: string
    body: string
    detail: string
  }
  journey: {
    heading: string
    intro: string
    steps: readonly { title: string; body: string }[]
  }
  reviews: {
    heading: string
    rating: string
    isSample?: boolean
    sampleNotice?: string
    items: readonly { body: string; initial: string; name: string; detail: string }[]
  }
  lab: { label: string; heading: string; body: string }
  slider: { before: string; after: string; label: string }
  documents: { heading: string; verify: string }
}

// Keep the brand's exact English tagline consistent across all seven regions.
export const HOME_TAGLINE = {
  headline: 'European research-grade peptides,',
  accent: 'delivered with precision.',
}

export const homeCopy: Record<Language, HomeCopy> = {
  en: {
    viewCatalog: 'View Catalog',
    freeConsultation: 'Free Consultation',
    startConsultation: 'Start Free Consultation',
    hero: {
      trusted: 'Trusted and used by influencers, physicians, and wellness practitioners.',
      body: 'European research-grade peptides for fat loss, muscle gain, regeneration & lifespan, recovery, and cognitive focus — all on one platform.',
      settings: 'Your regional settings',
      trust: [
        'Lab-tested before every shipment.',
        '24/7 customer support.',
        'Secure, temperature-controlled delivery.',
      ],
    },
    principles: {
      heading: 'Built for those serious about regeneration & lifespan',
      items: [
        { title: 'Controlled Quality', body: 'No products of unclear origin. Every batch is produced in manufacturing facilities that meet European quality standards, with strict quality control.' },
        { title: 'Free 24/7 Consultation', body: 'Our team helps you choose the right product and protocol before you buy. No cost, no pressure.' },
        { title: 'Full Transparency', body: 'Product specifications are verifiable for every order. You know exactly what you are working with.' },
      ],
    },
    testimonial: {
      heading: 'Trusted by athletes and wellness practitioners',
      intro: "Fitness and regeneration & lifespan practitioners make Regen's premium peptides part of their routine.",
      disclaimer: '*Experiences shown are individual and do not necessarily represent the same results for everyone.',
      quote: '“My progress is back, and it keeps me motivated.”',
      body: "I've been training for a long time, but only now am I seeing real change. Within a few weeks my physique looked denser, muscles more defined, and my energy during training felt far better.",
      detail: 'Bodybuilding & wellness practitioner',
    },
    journey: {
      heading: 'Your regeneration & lifespan journey starts here',
      intro: 'From the first consultation to usage guidance, we help simplify every step so you can focus on your goal.',
      steps: [
        { title: 'Define your goal', body: 'Everyone has a different target — regeneration & lifespan, fat loss, recovery, performance, or cognitive support. We help clarify your goal before recommending the next step.' },
        { title: 'Get a tailored recommendation', body: 'Based on your goal and situation, our team explains the product options, protocols, and the approach that is most relevant. No consultation fee and no obligation to buy.' },
        { title: 'Start with confidence', body: 'Once you choose the right protocol, you receive usage guidance, product documentation, and full support from our team throughout the process.' },
      ],
    },
    reviews: {
      heading: 'What they say about Regen',
      rating: 'from 107 verified reviews',
      items: [
        { body: 'What sold me was the consultation. I came in with a list of questions and left actually understanding what I was ordering instead of just guessing.', initial: 'M', name: 'Marcus', detail: '43, Operations Manager' },
        { body: 'Box turned up cold, ice packs still solid, everything sealed. Honestly did not expect the packaging to be this careful.', initial: 'C', name: 'Chloe', detail: '29, Brand Strategist' },
        { body: 'Been through a few suppliers over the years and most go quiet the moment you pay. These guys actually kept checking in after the order landed.', initial: 'D', name: 'Daniel', detail: '47, Sales Director' },
        { body: 'Ngl I was skeptical at first, but the whole thing felt legit. Verification code checked out, and the guide book made it easy to follow.', initial: 'K', name: 'Kayla', detail: '26, Content Creator' },
        { body: 'As a practitioner I need to see documentation, not marketing. Regen sent the Certificate of Analysis without me even having to ask twice. That earns trust.', initial: 'H', name: 'Hannah', detail: '39, Physician' },
        { body: 'Pen setup is genuinely easy. The clicks are precise so I always know exactly where my dose is.', initial: 'R', name: 'Ryan', detail: '34, Personal Trainer' },
        { body: 'Support replied within minutes when my shipment got held up, kept me posted the whole way, and sorted it out. Little things like that matter.', initial: 'G', name: 'Grace', detail: '37, Project Manager' },
        { body: 'Been running my protocol for a couple months now and the consistency batch to batch is what keeps me here. No surprises.', initial: 'N', name: 'Nathan', detail: '41, Software Engineer' },
        { body: 'Clean, no fuss, delivered on time. The cold-chain packaging is next level tbh.', initial: 'E', name: 'Emma', detail: '24, Nutritionist' },
      ],
    },
    lab: {
      label: 'Laboratory Testing',
      heading: 'Tested in European laboratories',
      body: 'Every batch we ship is tested by independent European laboratories against European quality standards, referencing the European Pharmacopoeia (Ph. Eur.) where applicable. A Certificate of Analysis is available for every order.',
    },
    slider: { before: 'Before', after: 'After', label: 'Before and after image comparison' },
    documents: { heading: 'COA and other lab testing documents', verify: 'Verify on the Janoshik website' },
  },
  ms: {
    viewCatalog: 'Lihat Katalog',
    freeConsultation: 'Konsultasi Percuma',
    startConsultation: 'Mulakan Konsultasi Percuma',
    hero: {
      trusted: 'Dipercayai dan digunakan oleh influencer, doktor dan profesional wellness.',
      body: 'Research-grade peptides dari Eropah untuk fat loss, pembinaan otot, regenerasi dan longevity, recovery serta fokus kognitif — semuanya dalam satu platform.',
      settings: 'Pilihan region anda',
      trust: [
        'Diuji di makmal sebelum setiap penghantaran.',
        'Customer support 24/7.',
        'Penghantaran selamat dengan suhu terkawal.',
      ],
    },
    principles: {
      heading: 'Untuk anda yang serius tentang regenerasi dan longevity',
      items: [
        { title: 'Kualiti yang Terjaga', body: 'Asal-usul produk jelas. Setiap batch dihasilkan di fasiliti pengeluaran yang memenuhi standard kualiti Eropah, dengan quality control yang ketat.' },
        { title: 'Konsultasi Percuma 24/7', body: 'Team kami bantu anda pilih produk dan protokol yang sesuai sebelum membeli. Percuma, tanpa paksaan.' },
        { title: 'Info Produk yang Telus', body: 'Spesifikasi produk boleh disahkan untuk setiap pesanan. Anda tahu dengan jelas apa yang anda gunakan.' },
      ],
    },
    testimonial: {
      heading: 'Dipercayai oleh atlet dan profesional wellness',
      intro: 'Peptides premium Regen menjadi sebahagian daripada rutin mereka yang aktif dalam fitness, regenerasi dan longevity.',
      disclaimer: '*Ini pengalaman individu. Hasilnya mungkin berbeza untuk setiap orang.',
      quote: '“Saya dah nampak progress semula, dan itu buat saya terus bersemangat.”',
      body: 'Saya dah lama training, tapi baru sekarang nampak perubahan yang nyata. Dalam beberapa minggu, badan nampak lebih padat, otot lebih jelas dan saya rasa jauh lebih bertenaga masa training.',
      detail: 'Bodybuilding & wellness practitioner',
    },
    journey: {
      heading: 'Perjalanan regenerasi dan longevity anda bermula di sini',
      intro: 'Dari konsultasi pertama sampai panduan penggunaan, kami bantu mudahkan setiap langkah supaya anda boleh fokus pada matlamat anda.',
      steps: [
        { title: 'Tetapkan matlamat anda', body: 'Setiap orang ada matlamat berbeza — regenerasi dan longevity, fat loss, recovery, prestasi atau sokongan kognitif. Kami bantu anda jelaskan matlamat itu sebelum cadangkan langkah seterusnya.' },
        { title: 'Dapatkan cadangan yang sesuai', body: 'Berdasarkan matlamat dan keadaan anda, team kami terangkan pilihan produk, protokol dan pendekatan yang paling relevan. Konsultasi percuma, dan anda tak perlu membeli.' },
        { title: 'Bermula dengan yakin', body: 'Bila anda dah pilih protokol yang sesuai, kami sediakan panduan penggunaan, dokumen produk dan support penuh sepanjang proses.' },
      ],
    },
    reviews: {
      heading: 'Apa kata mereka tentang Regen',
      rating: 'daripada 107 ulasan yang disahkan',
      items: [
        { body: 'Yang buat saya yakin ialah konsultasinya. Saya datang dengan senarai soalan dan akhirnya faham betul apa yang saya order, bukan sekadar agak-agak.', initial: 'M', name: 'Marcus', detail: '43, Pengurus Operasi' },
        { body: 'Kotak sampai dalam keadaan sejuk, ice pack masih beku dan semuanya masih sealed. Saya memang tak sangka packaging dia seteliti ini.', initial: 'C', name: 'Chloe', detail: '29, Pakar Strategi Jenama' },
        { body: 'Saya dah cuba beberapa supplier selama bertahun-tahun. Kebanyakannya terus senyap selepas saya bayar, tapi team ini masih follow up lepas order sampai.', initial: 'D', name: 'Daniel', detail: '47, Pengarah Jualan' },
        { body: 'Jujur, mula-mula saya ragu juga. Tapi seluruh proses rasa meyakinkan. Kod pengesahan pun sah, dan guide book senang nak ikut.', initial: 'K', name: 'Kayla', detail: '26, Pencipta Kandungan' },
        { body: 'Dalam kerja saya, saya perlukan dokumentasi, bukan sekadar marketing. Regen hantar Certificate of Analysis tanpa saya perlu minta berkali-kali. Itu yang buat saya percaya.', initial: 'H', name: 'Dr. Hannah', detail: '39, Doktor' },
        { body: 'Pen ini memang senang nak setup. Kliknya tepat, jadi saya sentiasa tahu tetapan dos saya.', initial: 'R', name: 'Ryan', detail: '34, Jurulatih Peribadi' },
        { body: 'Bila penghantaran saya tertangguh, support balas dalam beberapa minit. Mereka terus bagi update sampai isu itu selesai. Perkara kecil macam ini penting.', initial: 'G', name: 'Grace', detail: '37, Pengurus Projek' },
        { body: 'Saya dah ikut protokol selama beberapa bulan. Konsistensi dari batch ke batch buat saya terus pilih Regen. Tak ada kejutan.', initial: 'N', name: 'Nathan', detail: '41, Jurutera Perisian' },
        { body: 'Bersih, tak leceh dan sampai tepat pada masa. Packaging cold-chain dia memang bagus.', initial: 'E', name: 'Emma', detail: '24, Pakar Pemakanan' },
      ],
    },
    lab: {
      label: 'Ujian Makmal',
      heading: 'Diuji di makmal Eropah',
      body: 'Setiap batch yang kami hantar diuji oleh makmal bebas di Eropah mengikut standard kualiti Eropah, dengan rujukan kepada European Pharmacopoeia (Ph. Eur.) jika berkaitan. Certificate of Analysis (COA) tersedia untuk setiap pesanan.',
    },
    slider: { before: 'Sebelum', after: 'Selepas', label: 'Perbandingan gambar sebelum dan selepas' },
    documents: { heading: 'COA dan dokumen ujian makmal lain', verify: 'Sahkan di laman web Janoshik' },
  },
  id: {
    viewCatalog: 'Lihat Katalog',
    freeConsultation: 'Konsultasi Gratis',
    startConsultation: 'Mulai Konsultasi Gratis',
    hero: {
      trusted: 'Dipercaya dan digunakan oleh influencer, dokter, dan praktisi wellness.',
      body: 'Research-grade peptides dari Eropa untuk fat loss, pembentukan otot, regenerasi dan longevity, recovery, serta fokus kognitif — semuanya di satu platform.',
      settings: 'Pilihan region kamu',
      trust: [
        'Diuji di lab sebelum setiap pengiriman.',
        'Customer support 24/7.',
        'Pengiriman aman dengan suhu terjaga.',
      ],
    },
    principles: {
      heading: 'Buat kamu yang serius soal regenerasi dan longevity',
      items: [
        { title: 'Kualitas yang Terjaga', body: 'Asal-usul produk jelas. Setiap batch dibuat di fasilitas produksi yang memenuhi standar kualitas Eropa, dengan quality control yang ketat.' },
        { title: 'Konsultasi Gratis 24/7', body: 'Tim kami bantu kamu pilih produk dan protokol yang sesuai sebelum beli. Gratis, tanpa tekanan untuk beli.' },
        { title: 'Informasi Produk yang Jelas', body: 'Spesifikasi produk bisa kamu verifikasi untuk setiap pesanan. Jadi, kamu tahu persis produk yang kamu gunakan.' },
      ],
    },
    testimonial: {
      heading: 'Dipercaya atlet dan praktisi wellness',
      intro: 'Peptides premium Regen jadi bagian dari rutinitas praktisi fitness, regenerasi, dan longevity.',
      disclaimer: '*Ini pengalaman individu. Hasil tiap orang bisa berbeda.',
      quote: '“Saya mulai lihat progres lagi, dan itu bikin saya tetap semangat.”',
      body: 'Saya sudah lama latihan, tapi baru sekarang kelihatan perubahan yang nyata. Dalam beberapa minggu, badan saya terlihat lebih padat, otot lebih tegas, dan energi saat latihan terasa jauh lebih baik.',
      detail: 'Praktisi bodybuilding dan wellness',
    },
    journey: {
      heading: 'Mulai perjalanan regenerasi dan longevity kamu di sini',
      intro: 'Dari konsultasi pertama sampai panduan penggunaan, kami bantu bikin tiap langkah lebih jelas. Jadi, kamu bisa fokus ke tujuanmu.',
      steps: [
        { title: 'Tentukan tujuan kamu', body: 'Tujuan tiap orang beda — regenerasi dan longevity, fat loss, recovery, performa, atau dukungan kognitif. Kami bantu kamu memperjelas tujuan sebelum bahas langkah berikutnya.' },
        { title: 'Cari rekomendasi yang sesuai', body: 'Dari tujuan dan kondisi kamu, tim kami jelaskan pilihan produk, protokol, dan pendekatan yang paling sesuai. Konsultasinya gratis, tanpa wajib beli.' },
        { title: 'Mulai dengan yakin', body: 'Setelah memilih protokol yang sesuai, kamu dapat panduan penggunaan, dokumen produk, dan support penuh dari tim kami sepanjang proses.' },
      ],
    },
    reviews: {
      heading: 'Cerita tentang Regen',
      rating: '',
      isSample: true,
      sampleNotice: 'Diadaptasi dari teks ulasan Eropa. Nama, usia, dan profesi rekaan; bukan testimoni pelanggan Indonesia atau rekomendasi tenaga kesehatan.',
      items: [
        { body: 'konsultasinya bikin yakin. Saya datang dengan banyaknya pertanyaan dan selalu ditanggepin, lalu jadi paham pesan apa, jadi ga nebak" lagi.', initial: 'R', name: 'Rajsfano', detail: '29 tahun · Manajer operasional klinik' },
        { body: 'Kotaknya sampai masih dingin, ice pack masih beku, dan semua segelnya utuh. nggak nyangka packaging-nya seteliti ini.', initial: 'M', name: 'Michael', detail: '32 tahun · Atlet Karate' },
        { body: 'Selama beberapa tahun saya sudah coba beberapa supplier. Kebanyakan nggak ada kabar lagi setelah dibayar, tapi tim ini tetap follow up setelah pesanan sampai.', initial: 'F', name: 'Fauzan', detail: '44 tahun · Kepala laboratorium' },
        { body: 'Awalnya saya cukup skeptis, jujur. Tapi prosesnya terasa meyakinkan, apalagi buku panduannya bikin langkah-langkahnya mudah diikuti.', initial: 'V', name: 'Valen', detail: '30 tahun · Ahli gizi' },
        { body: 'Sebagai praktisi, saya butuh dokumentasi, bukan sekadar marketing. Pihak Regen langsung mengirim Certificate of Analysis (COA) tanpa perlu saya minta dua kali. Ini yang bikin saya percaya.', initial: 'B', name: 'Billy', detail: '24 tahun · Trader' },
        { body: 'Setup pen-nya ternyata gampang. Kliknya presisi, jadi saya tahu persis dosis yang disetel.', initial: 'M', name: 'Marco', detail: '36 tahun · Fisioterapis' },
        { body: 'Waktu pengiriman saya tertahan, support membalas dalam hitungan menit. Saya terus dikabari sampai masalahnya beres. Buat saya, hal kecil seperti ini penting.', initial: 'A', name: 'Andika', detail: '35 tahun · Instruktur binaraga (PT)' },
        { body: 'Saya udah ngejalanin protokol ini selama beberapa bulan. Yang bikin saya tetap memilih Regen adalah konsistensi dari batch ke batch. Nggak ada surprise.', initial: 'R', name: 'Reza', detail: '21 tahun · Mahasiswa' },
        { body: 'Bersih, nggak ribet, dan sampai tepat waktu. Packaging cold-chain-nya juga bagus banget.', initial: 'I', name: 'Intan', detail: '28 tahun · Praktisi wellness' },
      ],
    },
    lab: {
      label: 'Lab Testing',
      heading: 'Diuji di lab Eropa',
      body: 'Setiap batch yang kami kirim diuji oleh lab independen di Eropa sesuai standar kualitas Eropa, mengacu pada European Pharmacopoeia (Ph. Eur.) jika berlaku. Certificate of Analysis (COA) tersedia untuk setiap pesanan.',
    },
    slider: { before: 'Before', after: 'After', label: 'Bandingkan foto before dan after' },
    documents: { heading: 'COA dan dokumen lab testing lainnya', verify: 'Cek di website Janoshik' },
  },
}

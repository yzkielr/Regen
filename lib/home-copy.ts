import type { Language, RegionId } from '@/lib/regions'

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

// Fictional review content for a website mockup, selected by region.
// Keep isSample and sampleNotice visible. These are not verified reviews
// or evidence of health outcomes. The Indonesian source block stays intact.
const REGIONAL_REVIEWS: Record<Exclude<RegionId, 'id'>, HomeCopy['reviews']> = {
  "au": {
    "heading": "Sample reviews — Australia",
    "rating": "",
    "isSample": true,
    "sampleNotice": "", // tempat naruh text dibawah Heading Reviews
    "items": [
      {
        "body": "Regen gave me enough detail to make a decision without turning it into a whole project. I wanted to understand the package options and got a sensible explanation. The conversation felt relaxed, which I appreciated as a first-time customer.",
        "initial": "E",
        "name": "Emma Wilson",
        "detail": "38 · Sustainability Consultant"
      },
      {
        "body": "Pretty stoked with the service. I sent my question after finishing work, checked back later and had a helpful reply waiting. Easy to deal with from the first message.",
        "initial": "L",
        "name": "Liam O'Connor",
        "detail": "34 · Electrician"
      },
      {
        "body": "The case has been surprisingly useful. After a few weeks, everything still has a place and I can find the information I need quickly. Keeping the set together has made my cupboard a little more organised.",
        "initial": "O",
        "name": "Olivia Nguyen",
        "detail": "29 · Early Childhood Educator"
      },
      {
        "body": "I asked for a breakdown before committing. They explained the package price, what it covered and which details needed confirming for my order. Having that written down made the decision straightforward.",
        "initial": "J",
        "name": "Jack Thompson",
        "detail": "45 · Construction Estimator"
      },
      {
        "body": "A follow-up question came to me a few days after the parcel arrived. Regen's reply referred to my actual order, which saved a lot of explaining. That attention to the conversation left a good impression.",
        "initial": "A",
        "name": "Ayesha Khan",
        "detail": "31 · Data Analyst"
      },
      {
        "body": "The parcel was well packed and the items were easy to check as I unpacked them. The protective packaging had clearly been thought through. It was a reassuring start.",
        "initial": "N",
        "name": "Noah Campbell",
        "detail": "42 · Vineyard Supervisor"
      },
      {
        "body": "I appreciated being told to take my time. I went away, read the information and came back with another question. The team was just as helpful the second time around, and I felt comfortable making my choice.",
        "initial": "S",
        "name": "Sophie Martin",
        "detail": "36 · Veterinary Receptionist"
      },
      {
        "body": "The finish on the pen feels neat and the markings are easy to see. I tend to notice how everyday objects are put together, and this made a good impression. The supporting information was presented just as clearly.",
        "initial": "B",
        "name": "Benjamin Clarke",
        "detail": "49 · Landscape Architect"
      },
      {
        "body": "No dramas with the order. I had the information I needed, knew what to expect next and could get on with my day. My inbox was grateful for the concise updates too.",
        "initial": "M",
        "name": "Mia Robinson",
        "detail": "27 · Film Editor"
      }
    ]
  },
  "eu": {
    "heading": "Sample reviews — European Union",
    "rating": "",
    "isSample": true,
    "sampleNotice": "",// tempat naruh text dibawah Heading Reviews
    "items": [
      {
        "body": "The packaging is practical and carefully arranged. I could check each item as I opened the set, and the printed information was easy to locate. Those small decisions make the experience feel considered.",
        "initial": "J",
        "name": "Jonas Weber",
        "detail": "37 · Industrial Designer · Germany"
      },
      {
        "body": "I was choosing between two formats and needed a clear explanation of the contents. Regen helped me compare them in a way that made sense. I left the conversation knowing what I was asking for.",
        "initial": "S",
        "name": "Sofia Conti",
        "detail": "34 · Textile Buyer · Italy"
      },
      {
        "body": "The product photographs and package descriptions gave me a useful starting point. The team then helped me check the details that mattered to my order. Everything felt calm and easy to follow.",
        "initial": "C",
        "name": "Camille Laurent",
        "detail": "29 · Art Restorer · France"
      },
      {
        "body": "I like a concise answer. I asked what was included, received a clear explanation and could make my decision. An enjoyable amount of administration, which is a sentence I rarely get to write.",
        "initial": "P",
        "name": "Pieter de Vries",
        "detail": "45 · Water Engineer · Netherlands"
      },
      {
        "body": "Being able to refer back to a written explanation has helped a lot. When I had another question about the set, I already knew which details to check. The information remained useful after the purchase.",
        "initial": "Z",
        "name": "Zofia Kowalska",
        "detail": "31 · Export Coordinator · Poland"
      },
      {
        "body": "I appreciated the care taken with the wording. A couple of terms were unfamiliar to me, and the explanation made them much easier to understand. Friendly, thoughtful communication throughout.",
        "initial": "I",
        "name": "Inês Ferreira",
        "detail": "42 · Translator · Portugal"
      },
      {
        "body": "The case closes neatly and keeps the contents easy to find. That sounds like a minor detail, but it has made storing the set more convenient. I am pleased with the practical side of the package.",
        "initial": "E",
        "name": "Erik Lindström",
        "detail": "38 · Energy Auditor · Sweden"
      },
      {
        "body": "I had to pause the conversation while I was busy with an event. When I returned, Regen still had the context and helped me finish checking the options. I appreciated not having to start the conversation again.",
        "initial": "L",
        "name": "Lucía Martínez",
        "detail": "27 · Event Planner · Spain"
      },
      {
        "body": "Lovely service. My question was answered properly, the next steps were clear and I felt comfortable asking for a little more detail. There was a welcome lack of fuss about the whole thing.",
        "initial": "C",
        "name": "Cian Murphy",
        "detail": "50 · University Administrator · Ireland"
      }
    ]
  },
  "us": {
    "heading": "Sample reviews — United States",
    "rating": "",
    "isSample": true,
    "sampleNotice": "", // tempat naruh text dibawah Heading Reviews
    "items": [
      {
        "body": "I care about getting the basics right: clear information, a clear price and someone who follows through. Regen handled all three well in my experience. I felt informed at each step of the order.",
        "initial": "J",
        "name": "Jordan Brooks",
        "detail": "40 · Supply Chain Coordinator"
      },
      {
        "body": "The person I spoke with made room for my questions. I never felt like I had to understand all the terminology before starting the conversation. That made the first purchase much more approachable.",
        "initial": "I",
        "name": "Isabella Morales",
        "detail": "33 · School Counselor"
      },
      {
        "body": "The set arrived with its contents neatly separated, so I could work through the package information as I unpacked it. I liked being able to check everything without creating a pile on the table.",
        "initial": "E",
        "name": "Ethan Reed",
        "detail": "47 · Insurance Adjuster"
      },
      {
        "body": "The labels are readable and the supporting information is laid out well. Over time, I've found it easier to check a detail without hunting for it. Good presentation has made the package more convenient to keep organised.",
        "initial": "M",
        "name": "Maya Patel",
        "detail": "28 · UX Researcher"
      },
      {
        "body": "Solid experience. I asked a specific question about the package and got a specific answer. That sounds simple, but it went a long way toward making me comfortable with the order.",
        "initial": "C",
        "name": "Caleb Walker",
        "detail": "35 · Fire Sprinkler Technician"
      },
      {
        "body": "My schedule is all over the place, so being able to pick up the conversation when I had a moment was a huge plus. The updates were easy to skim and the team kept track of what we had discussed.",
        "initial": "A",
        "name": "Avery Chen",
        "detail": "39 · Restaurant Owner"
      },
      {
        "body": "I asked for clarification on the written product details before making a decision. Regen took the time to explain what I was looking at and which points I should confirm. I appreciated that careful approach.",
        "initial": "N",
        "name": "Natalie Foster",
        "detail": "44 · Paralegal"
      },
      {
        "body": "I was low-key impressed by the follow-up. My question after delivery got the same attention as the ones before I ordered. It made the service feel consistent all the way through.",
        "initial": "A",
        "name": "Andre Mitchell",
        "detail": "30 · Audiovisual Technician"
      },
      {
        "body": "The case has finally given this corner of my shelf some structure. Everything fits together neatly, and the information stays with the set. A small win for someone whose usual filing system is 'I'll remember where I put it.'",
        "initial": "E",
        "name": "Elena Bennett",
        "detail": "26 · Library Assistant"
      }
    ]
  },
  "uk": {
    "heading": "Sample reviews — United Kingdom",
    "rating": "",
    "isSample": true,
    "sampleNotice": "", // tempat naruh text dibawah Heading Reviews
    "items": [
      {
        "body": "I wanted to check the contents and costs before ordering, and both were explained clearly. The conversation was straightforward and I had the details in writing afterwards. Exactly the sort of service I find reassuring.",
        "initial": "O",
        "name": "Oliver Bennett",
        "detail": "43 · Chartered Accountant"
      },
      {
        "body": "A very tidy ordering experience. The updates told me what I needed to know, and I could follow up when a question came to mind. It fitted around a fairly busy week with very little effort.",
        "initial": "A",
        "name": "Amelia Hughes",
        "detail": "32 · Railway Planner"
      },
      {
        "body": "I spent a while comparing the formats. Regen helped me understand the differences and gave me room to decide. I appreciated having a proper conversation about the options before choosing one.",
        "initial": "R",
        "name": "Ravi Shah",
        "detail": "37 · Business Analyst"
      },
      {
        "body": "The package was neatly put together and the contents were easy to identify. I particularly liked having the relevant information close at hand when unpacking. It gave the whole experience a thoughtful feel.",
        "initial": "I",
        "name": "Isla MacLeod",
        "detail": "29 · Music Teacher"
      },
      {
        "body": "The pen feels well finished and the case keeps the set in order. After a few weeks, I still find the packaging useful rather than something taking up space. Pleased with the practical details.",
        "initial": "G",
        "name": "George Turner",
        "detail": "48 · Property Surveyor"
      },
      {
        "body": "I'm usually replying to messages between rehearsals, so I appreciated being able to return to the same conversation later. Regen picked up where we had left off. One fewer thing to keep in my head.",
        "initial": "H",
        "name": "Hannah Price",
        "detail": "35 · Theatre Producer"
      },
      {
        "body": "I had a question after delivery and got a useful explanation. The team had clearly read what I was asking. A reassuring bit of aftercare, and a good reason to keep Regen in mind next time.",
        "initial": "A",
        "name": "Adam Williams",
        "detail": "31 · Software Developer"
      },
      {
        "body": "I tend to read the small print and then ask another question anyway. The team was patient throughout and explained the package details in plain English. An excellent fit for my mildly excessive checking habit.",
        "initial": "C",
        "name": "Charlotte Evans",
        "detail": "41 · Museum Curator"
      },
      {
        "body": "Really pleased with how helpful everyone was. I felt comfortable asking what was included and taking a little time to decide. A friendly experience from the first enquiry through to the follow-up.",
        "initial": "F",
        "name": "Freya Lawson",
        "detail": "36 · Bakery Owner"
      }
    ]
  },
  "sg": {
    "heading": "Sample reviews — Singapore",
    "rating": "",
    "isSample": true,
    "sampleNotice": "", // tempat naruh text dibawah Heading Reviews
    "items": [
      {
        "body": "The package comparison was useful, but the conversation with Regen made the decision much clearer. They explained what was included and what I would need to check separately. I appreciated getting a straightforward answer without a sales pitch.",
        "initial": "M",
        "name": "Marcus Tan",
        "detail": "35 · Product Manager"
      },
      {
        "body": "I like keeping the paperwork together, so I asked where to find the product information before ordering. The team pointed me to the relevant details and explained what I should confirm. That made the whole process feel more organised.",
        "initial": "P",
        "name": "Priya Nair",
        "detail": "41 · Logistics Planner"
      },
      {
        "body": "Everything labelled clearly, so no need to guess which part was which. The layout of the set made unpacking simple, and keeping the contents together afterwards has been easy. Small detail, but I appreciate it.",
        "initial": "W",
        "name": "Wei Ming Lim",
        "detail": "32 · Civil Engineer"
      },
      {
        "body": "What stood out was being able to continue the same conversation after delivery. I had a question about the package, and the reply actually addressed it instead of sending me back to the beginning. That follow-through matters to me.",
        "initial": "N",
        "name": "Nur Aisyah",
        "detail": "29 · Interior Designer"
      },
      {
        "body": "I opened the parcel after a long shift and was pleased with how neatly everything was arranged. Nothing felt thrown into the box at the last minute. The packaging gave a good first impression, and the item list was easy to follow.",
        "initial": "C",
        "name": "Chloe Goh",
        "detail": "27 · Pastry Chef"
      },
      {
        "body": "Service was steady lah. I asked about the difference between two packages and got a clear comparison, including what I didn't need to buy. Being helped to spend sensibly is a good reason to come back.",
        "initial": "D",
        "name": "Daniel Koh",
        "detail": "46 · Financial Controller"
      },
      {
        "body": "I wasn't ready to decide straight away. Regen answered my questions, gave me time to think and didn't keep pushing for an order. When I came back to the conversation, they picked it up without making it awkward.",
        "initial": "F",
        "name": "Farah Abdullah",
        "detail": "37 · HR Business Partner"
      },
      {
        "body": "I was a bit paiseh asking such a basic question about the cartridge and pen options. The reply was patient and easy to understand. Glad I asked instead of trying to work it all out from the photos.",
        "initial": "A",
        "name": "Arjun Menon",
        "detail": "30 · Cybersecurity Analyst"
      },
      {
        "body": "The best part for me has been having the package information and follow-up messages in one place. I can check a detail without searching through old screenshots. It's a small improvement to my routine, but a useful one.",
        "initial": "J",
        "name": "Jolene Teo",
        "detail": "52 · Florist"
      }
    ]
  },
  "my": {
    "heading": "Sample reviews — Malaysia",
    "rating": "",
    "isSample": true,
    "sampleNotice": "", // tempat naruh text dibawah Heading Reviews
    "items": [
      {
        "body": "I keep a spreadsheet for just about everything, so I appreciated having the package details explained clearly before payment. The information was easy to compare and the team didn't make me feel fussy for checking. A good experience overall.",
        "initial": "M",
        "name": "Mei Lin Wong",
        "detail": "33 · E-commerce Merchandiser"
      },
      {
        "body": "Saya tanya beza Basic Package dengan Cartridge Package sebab gambar sahaja tak cukup jelas untuk saya. Team Regen terangkan satu-satu dengan bahasa yang senang faham. Lepas tu baru saya boleh buat pilihan dengan lebih yakin.",
        "initial": "N",
        "name": "Nur Farah",
        "detail": "28 · Pereka Grafik"
      },
      {
        "body": "The team was clear about the quoted price and the details I still needed to confirm. I prefer that to getting a vague total and sorting everything out later. Regen made the conversation easy to follow from the start.",
        "initial": "K",
        "name": "Kavitha Raj",
        "detail": "39 · Quantity Surveyor"
      },
      {
        "body": "Saya ni banyak soalan, kadang-kadang macam sesi soal jawab peperiksaan pula. Tapi mereka layan elok dan jawapan pun bukan salin tampal. Memang saya hargai bila orang ambil masa untuk pastikan kita betul-betul faham.",
        "initial": "D",
        "name": "Danial Hakim",
        "detail": "31 · Juruteknik Automotif"
      },
      {
        "body": "Saya sibuk waktu bekerja, jadi senang bila maklumat pesanan diberi dengan tersusun. Boleh baca semula bila dah lapang tanpa perlu telefon berkali-kali. Cara mereka uruskan pertanyaan memang membantu.",
        "initial": "A",
        "name": "Amirul Azlan",
        "detail": "44 · Penyelia Tapak"
      },
      {
        "body": "The parcel looked carefully put together, with the contents arranged so I could check them against the package details. I liked that practical touch. It felt considered, without adding unnecessary extras just to make the box look busy.",
        "initial": "J",
        "name": "Jason Lee",
        "detail": "36 · Hotel Front Office Manager"
      },
      {
        "body": "Label dan maklumat pada set senang dibaca. Saya lebih mudah susun dan semak barang selepas buka bungkusan, tak perlu cari maklumat sana sini. Bagi saya, benda kecil macam ini buat pengalaman dengan produk rasa lebih teratur.",
        "initial": "A",
        "name": "Aina Sofea",
        "detail": "26 · Jurugambar"
      },
      {
        "body": "I changed my mind about the package before placing the order. The team helped me compare the options again and explained what would change. No impatience, no pressure to stick with the more expensive choice. I respected that.",
        "initial": "S",
        "name": "Suresh Kumar",
        "detail": "48 · Procurement Executive"
      },
      {
        "body": "Selepas barang sampai, saya masih dapat jawapan bila ada soalan tentang maklumat produk. Tak rasa macam urusan habis sebaik sahaja bayaran dibuat. Layanan selepas pembelian itu yang buat saya selesa untuk berurusan dengan Regen lagi.",
        "initial": "Y",
        "name": "Yasmin Zulkifli",
        "detail": "40 · Pemilik Kedai Buku"
      }
    ]
  }
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
    reviews: REGIONAL_REVIEWS.eu,
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
    reviews: REGIONAL_REVIEWS.my,
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
      sampleNotice: '',
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

// Use this in the Reviews component so regions sharing English have
// distinct review sets. Indonesia always uses its original review content.
export function getRegionReviews(regionId: RegionId): HomeCopy['reviews'] {
  return regionId === 'id' ? homeCopy.id.reviews : REGIONAL_REVIEWS[regionId]
}

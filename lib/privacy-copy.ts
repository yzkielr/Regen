import type { Language } from './regions'

// Keep this draft flag until the policy reflects Regen's actual practices.
export const PRIVACY_IS_DRAFT = true
export const PRIVACY_EMAIL = 'contact@regenlongevitylab.com'

export type PrivacyBlock =
  | { kind: 'p' | 'note'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'request' }

export interface PrivacyCopy {
  title: string
  description: string
  intro: string
  back: string
  draftDateLabel: string
  updatedLabel: string
  date: string
  draftAria: string
  draftTitle: string
  draftBody: string
  tocAria: string
  tocTitle: string
  contactTitle: string
  whatsappPrivacy: string
  whatsappTerms: string
  requestSubject: string
  requestButton: string
  sections: { id: string; title: string; blocks: PrivacyBlock[] }[]
}

// Only **bold** and the three explicit [[link]] tokens are rendered as markup.
// Every language contains the same sections and commitments.
export const privacyCopy: Record<Language, PrivacyCopy> = {
  "id": {
    "title": "Kebijakan Privasi",
    "description": "Informasi tentang penggunaan data pelanggan, komunikasi WhatsApp, dan cara mengajukan permintaan akses atau penghapusan data kepada Regen.",
    "intro": "Bagaimana kami menggunakan informasi Anda, menjaga kerahasiaannya, dan membantu Anda mengelola data pribadi.",
    "back": "Kembali ke Regen",
    "draftDateLabel": "Draf disusun",
    "updatedLabel": "Terakhir diperbarui",
    "date": "17 September 2026",
    "draftAria": "Status dokumen",
    "draftTitle": "Draf untuk ditinjau sebelum dipublikasikan",
    "draftBody": "Identitas pengelola, penyedia layanan, penggunaan otomasi atau AI, pengaturan cookie, dan ketentuan penyimpanan perlu disesuaikan dengan praktik Regen yang sebenarnya.",
    "tocAria": "Daftar isi kebijakan privasi",
    "tocTitle": "Di halaman ini",
    "contactTitle": "Ada pertanyaan tentang data Anda?",
    "whatsappPrivacy": "Kebijakan Privasi WhatsApp",
    "whatsappTerms": "Ketentuan Pemrosesan Data WhatsApp Business",
    "requestSubject": "Permintaan Penghapusan Data Pribadi — Regen",
    "requestButton": "Ajukan penghapusan melalui email",
    "sections": [
      {
        "id": "tentang",
        "title": "Tentang kebijakan ini",
        "blocks": [
          {
            "kind": "p",
            "text": "Kebijakan ini menjelaskan pemrosesan data pribadi oleh Regen Longevity Lab (“Regen”, “kami”) ketika Anda mengunjungi situs kami, menghubungi tim melalui WhatsApp atau email, mengajukan pertanyaan, maupun menggunakan layanan pemesanan dan dukungan pelanggan."
          },
          {
            "kind": "p",
            "text": "Regen bertanggung jawab atas tujuan penggunaan data yang kami kelola. Layanan pihak ketiga juga dapat memiliki ketentuan privasi sendiri. Pertanyaan tentang kebijakan ini dapat dikirim ke [[email]]."
          }
        ]
      },
      {
        "id": "data",
        "title": "Data yang kami terima",
        "blocks": [
          {
            "kind": "p",
            "text": "Jenis data bergantung pada informasi yang Anda berikan dan layanan yang Anda gunakan:"
          },
          {
            "kind": "ul",
            "items": [
              "**Identitas dan kontak:** nama, nama profil WhatsApp, nomor telepon atau WhatsApp, serta alamat email yang Anda berikan.",
              "**Percakapan:** isi pesan, pertanyaan, tanggapan, lampiran yang Anda kirim, waktu komunikasi, serta catatan tindak lanjut layanan pelanggan.",
              "**Informasi pesanan:** produk dan paket yang dipilih, jumlah, nama penerima, alamat pengiriman, serta konfirmasi atau status pembayaran yang diperlukan untuk menangani pesanan Anda.",
              "**Informasi teknis:** data yang tercatat saat mengakses situs atau layanan, yang dapat mencakup alamat IP, jenis perangkat atau browser, waktu akses, dan catatan kesalahan untuk pengoperasian serta keamanan layanan.",
              "**Preferensi:** pilihan wilayah, bahasa, mata uang, serta pilihan menerima atau menghentikan komunikasi."
            ]
          },
          {
            "kind": "p",
            "text": "Berikan informasi yang diperlukan untuk permintaan Anda. Jangan mengirimkan kata sandi, kode OTP, PIN, nomor kartu pembayaran lengkap, atau dokumen kesehatan dan identitas yang tidak diperlukan melalui percakapan biasa. Jika informasi sensitif telanjur dikirim, Anda dapat meminta peninjauan atau penghapusannya."
          }
        ]
      },
      {
        "id": "tujuan",
        "title": "Tujuan penggunaan data",
        "blocks": [
          {
            "kind": "ul",
            "items": [
              "Menjawab pertanyaan, menjelaskan informasi produk dan paket, serta menindaklanjuti permintaan Anda.",
              "Memproses dan mengonfirmasi pesanan, mengatur pengiriman, serta menangani dukungan atau keluhan.",
              "Menjaga riwayat komunikasi yang diperlukan agar tim dapat melanjutkan penanganan permintaan Anda.",
              "Menjaga keamanan situs dan komunikasi, menangani gangguan, serta mencegah penyalahgunaan.",
              "Memenuhi kewajiban hukum, administrasi transaksi, atau penanganan sengketa yang berlaku.",
              "Mengirimkan pesan pemasaran apabila Anda telah memberikan persetujuan yang diperlukan, dengan pilihan untuk berhenti."
            ]
          },
          {
            "kind": "p",
            "text": "Dasar pemrosesan disesuaikan dengan tujuannya: pelaksanaan permintaan atau transaksi Anda, kewajiban hukum, persetujuan untuk penggunaan yang memerlukannya, atau kepentingan yang sah dengan mempertimbangkan hak Anda. Mengunjungi situs atau mengirimkan pertanyaan tidak otomatis berarti menyetujui semua pesan pemasaran."
          }
        ]
      },
      {
        "id": "layanan",
        "title": "Layanan dan penerima data",
        "blocks": [
          {
            "kind": "p",
            "text": "Data dapat diakses oleh tim yang menangani permintaan Anda dan penyedia layanan yang diperlukan untuk tujuan tersebut. Informasi yang dibagikan dibatasi pada kebutuhan layanan terkait:"
          },
          {
            "kind": "ul",
            "items": [
              "**WhatsApp/Meta:** untuk menyediakan dan mengoperasikan komunikasi WhatsApp. Pemrosesan oleh platform mengikuti ketentuan layanan dan privasinya, termasuk ketentuan yang berlaku untuk layanan bisnis.",
              "**Layanan situs dan komunikasi:** penyedia hosting, email, atau penyimpanan yang digunakan Regen dapat memproses data yang diperlukan untuk mengoperasikan layanan terkait.",
              "**Layanan pesanan:** apabila diperlukan untuk pesanan Anda, penyedia pembayaran atau pengiriman menerima informasi yang dibutuhkan untuk menjalankan tugasnya.",
              "**Pihak yang berwenang:** informasi dapat diberikan apabila diwajibkan oleh hukum atau diperlukan untuk menanggapi permintaan yang sah."
            ]
          },
          {
            "kind": "p",
            "text": "Kami tidak menjual data pribadi Anda. Isi percakapan pelanggan tidak dibagikan kepada pelanggan lain."
          },
          {
            "kind": "p",
            "text": "Informasi platform tersedia di [[whatsappPrivacy]] dan [[whatsappTerms]]."
          }
        ]
      },
      {
        "id": "whatsapp",
        "title": "Komunikasi WhatsApp",
        "blocks": [
          {
            "kind": "p",
            "text": "Ketika Anda menghubungi Regen melalui WhatsApp, kami menerima nomor atau identitas kontak yang disediakan platform serta pesan yang Anda kirim kepada kami. Data tersebut digunakan untuk menangani komunikasi dan permintaan Anda."
          },
          {
            "kind": "p",
            "text": "Anda dapat meminta agar pesan pemasaran dihentikan dengan membalas “BERHENTI” atau menyampaikan permintaan melalui email. Penghentian pemasaran tidak menghalangi kami menanggapi permintaan baru dari Anda atau menyampaikan informasi yang diperlukan terkait transaksi yang masih berlangsung, sesuai ketentuan yang berlaku."
          },
          {
            "kind": "p",
            "text": "Jika ingin berbicara dengan tim atau meminta penjelasan tentang penggunaan data percakapan, hubungi [[email]]."
          }
        ]
      },
      {
        "id": "cookie",
        "title": "Cookie dan preferensi situs",
        "blocks": [
          {
            "kind": "p",
            "text": "Situs dapat menggunakan cookie atau penyimpanan browser untuk mengingat pilihan wilayah, bahasa, dan mata uang serta mendukung fungsi layanan. Anda dapat mengelola atau menghapusnya melalui pengaturan browser; sebagian preferensi mungkin perlu dipilih kembali."
          },
          {
            "kind": "p",
            "text": "Penggunaan teknologi analitik atau pemasaran, jika diaktifkan, perlu dijelaskan secara terpisah beserta pilihan persetujuannya sesuai ketentuan yang berlaku. Persetujuan tidak dianggap diberikan hanya karena Anda membuka halaman ini."
          }
        ]
      },
      {
        "id": "penyimpanan",
        "title": "Penyimpanan dan transfer data",
        "blocks": [
          {
            "kind": "p",
            "text": "Data disimpan selama diperlukan untuk tujuan pengumpulannya. Pertimbangan lama penyimpanan meliputi penyelesaian percakapan atau pesanan, dukungan setelah transaksi, kewajiban pencatatan yang berlaku, serta penyelesaian keluhan atau sengketa. Data yang tidak lagi diperlukan dihapus atau dianonimkan, dengan memperhatikan kewajiban penyimpanan yang masih berlaku."
          },
          {
            "kind": "p",
            "text": "Penghapusan perlu mencakup sistem aktif dan pengelolaan salinan cadangan sesuai jadwal penyimpanannya. Anda dapat meminta informasi lebih lanjut mengenai lama penyimpanan data yang terkait dengan Anda melalui kontak kami."
          },
          {
            "kind": "p",
            "text": "Penyedia layanan dapat memproses data di negara berbeda dari lokasi Anda. Transfer lintas negara, apabila terjadi, harus menggunakan dasar serta perlindungan yang sesuai dengan ketentuan pelindungan data yang berlaku."
          }
        ]
      },
      {
        "id": "keamanan",
        "title": "Perlindungan data",
        "blocks": [
          {
            "kind": "p",
            "text": "Kami berkomitmen membatasi akses data kepada pihak yang memerlukannya untuk tugas layanan, menjaga kerahasiaan akses tersebut, dan menerapkan langkah pengamanan yang sesuai dengan jenis serta risiko pemrosesan data."
          },
          {
            "kind": "p",
            "text": "Tidak ada sistem yang dapat menjamin keamanan mutlak. Jika terjadi insiden yang mewajibkan pemberitahuan, kami akan menanganinya dan menyampaikan informasi kepada pihak terkait sesuai ketentuan yang berlaku."
          }
        ]
      },
      {
        "id": "hak",
        "title": "Hak dan pilihan Anda",
        "blocks": [
          {
            "kind": "p",
            "text": "Sesuai hukum yang berlaku, Anda dapat meminta informasi tentang pemrosesan data, akses atau salinan data, perbaikan data yang tidak akurat, penarikan persetujuan, penghentian atau pembatasan pemrosesan, serta penghapusan data. Hak lain, termasuk keberatan atau pemindahan data, berlaku sejauh diatur untuk keadaan Anda."
          },
          {
            "kind": "p",
            "text": "Penarikan persetujuan tidak membatalkan pemrosesan yang sah sebelum permintaan tersebut. Sebagian layanan atau transaksi mungkin tidak dapat dilanjutkan apabila data yang diperlukan tidak tersedia."
          },
          {
            "kind": "p",
            "text": "Jika Anda merasa penanganan data tidak sesuai, sampaikan keluhan kepada kami. Anda juga dapat menghubungi otoritas yang berwenang sesuai yurisdiksi Anda. Apabila data anak terkirim kepada kami, orang tua atau wali dapat menghubungi kami untuk meminta peninjauan dan penanganan yang sesuai."
          }
        ]
      },
      {
        "id": "penghapusan",
        "title": "Meminta penghapusan data",
        "blocks": [
          {
            "kind": "p",
            "text": "Kirim email ke [[email]] dengan subjek **“Permintaan Penghapusan Data Pribadi — Regen”**."
          },
          {
            "kind": "ol",
            "items": [
              "Sertakan nama dan nomor WhatsApp atau email yang digunakan untuk berkomunikasi dengan Regen.",
              "Jelaskan data yang ingin dihapus; nomor pesanan atau perkiraan tanggal percakapan dapat membantu pencarian.",
              "Kami dapat meminta verifikasi secukupnya untuk melindungi data dari permintaan pihak yang tidak berhak. Jangan mengirimkan salinan identitas terlebih dahulu jika belum diminta melalui proses yang sesuai.",
              "Kami akan meninjau permintaan dan menyampaikan hasilnya dalam batas waktu yang diwajibkan hukum yang berlaku."
            ]
          },
          {
            "kind": "p",
            "text": "Jika sebagian data masih wajib disimpan, misalnya untuk kewajiban pencatatan transaksi atau sengketa yang belum selesai, kami akan menjelaskan alasan serta cakupan penyimpanannya. Penghapusan pada sistem Regen tidak otomatis menghapus data yang dikelola secara mandiri oleh WhatsApp/Meta atau pihak lain berdasarkan ketentuan mereka sendiri."
          },
          {
            "kind": "request"
          },
          {
            "kind": "note",
            "text": "Tombol ini membuka aplikasi email. Permintaan dikirim setelah Anda menekan kirim di aplikasi tersebut."
          }
        ]
      },
      {
        "id": "perubahan",
        "title": "Perubahan kebijakan",
        "blocks": [
          {
            "kind": "p",
            "text": "Kebijakan dapat diperbarui ketika layanan, praktik pemrosesan data, atau ketentuan yang berlaku berubah. Tanggal pembaruan dicantumkan pada halaman ini. Perubahan penting akan diberitahukan melalui cara yang sesuai, dan persetujuan baru akan diminta apabila diperlukan."
          },
          {
            "kind": "p",
            "text": "Untuk pertanyaan, koreksi, atau permintaan terkait privasi, hubungi [[email]]."
          }
        ]
      }
    ]
  },
  "en": {
    "title": "Privacy Policy",
    "description": "How Regen uses customer information and WhatsApp conversations, and how to request access to or deletion of your personal data.",
    "intro": "How we use your information, protect its confidentiality, and help you manage your personal data.",
    "back": "Back to Regen",
    "draftDateLabel": "Draft prepared",
    "updatedLabel": "Last updated",
    "date": "17 September 2026",
    "draftAria": "Document status",
    "draftTitle": "Draft for review before publication",
    "draftBody": "The operator's identity, service providers, use of automation or AI, cookie settings, and retention arrangements must reflect Regen's actual practices.",
    "tocAria": "Privacy policy contents",
    "tocTitle": "On this page",
    "contactTitle": "Questions about your data?",
    "whatsappPrivacy": "WhatsApp Privacy Policy",
    "whatsappTerms": "WhatsApp Business Data Processing Terms",
    "requestSubject": "Personal Data Deletion Request — Regen",
    "requestButton": "Request deletion by email",
    "sections": [
      {
        "id": "tentang",
        "title": "About this policy",
        "blocks": [
          {
            "kind": "p",
            "text": "This policy explains how Regen Longevity Lab (“Regen”, “we”, “us”) processes personal data when you visit our website, contact our team through WhatsApp or email, make an enquiry, or use our ordering and customer support services."
          },
          {
            "kind": "p",
            "text": "Regen is responsible for the purposes for which we use the data we control. Third-party services may also have their own privacy terms. You can send questions about this policy to [[email]]."
          }
        ]
      },
      {
        "id": "data",
        "title": "Information we receive",
        "blocks": [
          {
            "kind": "p",
            "text": "The types of data depend on the information you provide and the services you use:"
          },
          {
            "kind": "ul",
            "items": [
              "**Identity and contact details:** your name, WhatsApp profile name, telephone or WhatsApp number, and any email address you provide.",
              "**Conversations:** message content, questions, replies, attachments you send, communication timestamps, and customer service follow-up notes.",
              "**Order information:** selected products and packages, quantities, recipient name, delivery address, and payment confirmations or status needed to handle your order.",
              "**Technical information:** data recorded when you access the website or services, which may include your IP address, device or browser type, access times, and error logs used to operate and secure the services.",
              "**Preferences:** your region, language and currency choices, and your choices about receiving or stopping communications."
            ]
          },
          {
            "kind": "p",
            "text": "Please provide only the information needed for your request. Do not send passwords, one-time passcodes, PINs, full payment card numbers, or unnecessary health or identity documents in ordinary conversations. If you have already sent sensitive information, you can ask us to review or delete it."
          }
        ]
      },
      {
        "id": "tujuan",
        "title": "How we use your data",
        "blocks": [
          {
            "kind": "ul",
            "items": [
              "To answer questions, explain products and packages, and follow up on your requests.",
              "To process and confirm orders, arrange delivery, and handle support requests or complaints.",
              "To retain the communication history needed for our team to continue handling your request.",
              "To protect our website and communications, resolve service issues, and prevent misuse.",
              "To meet applicable legal obligations, maintain transaction records, or handle disputes.",
              "To send marketing messages where you have given the required consent, with an option to stop receiving them."
            ]
          },
          {
            "kind": "p",
            "text": "The basis for processing depends on its purpose: carrying out your request or transaction, meeting legal obligations, obtaining consent where required, or pursuing legitimate interests while considering your rights. Visiting the website or sending an enquiry does not automatically mean you consent to all marketing messages."
          }
        ]
      },
      {
        "id": "layanan",
        "title": "Services and data recipients",
        "blocks": [
          {
            "kind": "p",
            "text": "Our team members who handle your request and the service providers needed for that purpose may access your data. Information shared is limited to what the relevant service needs:"
          },
          {
            "kind": "ul",
            "items": [
              "**WhatsApp/Meta:** to provide and operate WhatsApp communications. The platform's processing is governed by its service and privacy terms, including terms applicable to business services.",
              "**Website and communication services:** hosting, email or storage providers used by Regen may process the data needed to operate those services.",
              "**Order services:** where necessary for your order, payment or delivery providers receive the information needed to perform their tasks.",
              "**Authorised bodies:** information may be provided where required by law or necessary to respond to a lawful request."
            ]
          },
          {
            "kind": "p",
            "text": "We do not sell your personal data. Customer conversations are not shared with other customers."
          },
          {
            "kind": "p",
            "text": "Information about the platform is available in the [[whatsappPrivacy]] and the [[whatsappTerms]]."
          }
        ]
      },
      {
        "id": "whatsapp",
        "title": "WhatsApp communications",
        "blocks": [
          {
            "kind": "p",
            "text": "When you contact Regen through WhatsApp, we receive the number or contact identity provided by the platform and the messages you send us. We use this data to handle your communications and requests."
          },
          {
            "kind": "p",
            "text": "You can ask us to stop marketing messages by replying “STOP” or emailing your request. Stopping marketing does not prevent us from responding to new requests you make or providing necessary information about an ongoing transaction, in accordance with applicable rules."
          },
          {
            "kind": "p",
            "text": "To speak with our team or ask how conversation data is used, contact [[email]]."
          }
        ]
      },
      {
        "id": "cookie",
        "title": "Cookies and website preferences",
        "blocks": [
          {
            "kind": "p",
            "text": "The website may use cookies or browser storage to remember your region, language and currency choices and to support service functions. You can manage or delete them in your browser settings; you may need to select some preferences again."
          },
          {
            "kind": "p",
            "text": "Any analytics or marketing technologies, if enabled, need to be explained separately, along with consent choices required by applicable rules. Opening this page alone is not treated as consent."
          }
        ]
      },
      {
        "id": "penyimpanan",
        "title": "Data retention and transfers",
        "blocks": [
          {
            "kind": "p",
            "text": "Data is retained for as long as needed for the purposes for which it was collected. Retention considerations include completing conversations or orders, providing support after a transaction, applicable record-keeping requirements, and resolving complaints or disputes. Data that is no longer needed is deleted or anonymised, subject to any continuing retention obligations."
          },
          {
            "kind": "p",
            "text": "Deletion needs to cover active systems and the management of backup copies in line with their retention schedules. You can contact us for more information about how long data relating to you is retained."
          },
          {
            "kind": "p",
            "text": "Service providers may process data in countries other than your own. Where cross-border transfers take place, they must use an appropriate basis and safeguards under applicable data protection requirements."
          }
        ]
      },
      {
        "id": "keamanan",
        "title": "Protecting your data",
        "blocks": [
          {
            "kind": "p",
            "text": "We are committed to limiting access to those who need the data for their service duties, maintaining the confidentiality of that access, and applying safeguards appropriate to the nature and risks of the processing."
          },
          {
            "kind": "p",
            "text": "No system can guarantee absolute security. If an incident requires notification, we will address it and inform the relevant parties in accordance with applicable requirements."
          }
        ]
      },
      {
        "id": "hak",
        "title": "Your rights and choices",
        "blocks": [
          {
            "kind": "p",
            "text": "Under applicable law, you may request information about processing, access to or a copy of your data, correction of inaccurate data, withdrawal of consent, cessation or restriction of processing, and deletion. Other rights, including objection or data portability, apply where provided for in your circumstances."
          },
          {
            "kind": "p",
            "text": "Withdrawing consent does not invalidate lawful processing before your request. Some services or transactions may not be able to continue if the necessary data is unavailable."
          },
          {
            "kind": "p",
            "text": "If you believe your data has not been handled appropriately, you can make a complaint to us. You may also contact the relevant authority in your jurisdiction. If a child's data is sent to us, a parent or guardian can contact us to request a review and appropriate handling."
          }
        ]
      },
      {
        "id": "penghapusan",
        "title": "Requesting data deletion",
        "blocks": [
          {
            "kind": "p",
            "text": "Email [[email]] with the subject **“Personal Data Deletion Request — Regen”**."
          },
          {
            "kind": "ol",
            "items": [
              "Include your name and the WhatsApp number or email address you used to communicate with Regen.",
              "Explain which data you want deleted; an order number or approximate conversation date can help us find it.",
              "We may request proportionate verification to protect your data against unauthorised requests. Do not send identity document copies in advance unless requested through an appropriate process.",
              "We will review your request and communicate the outcome within the time limits required by applicable law."
            ]
          },
          {
            "kind": "p",
            "text": "If some data must still be retained, for example for transaction record-keeping obligations or an unresolved dispute, we will explain the reason and scope of retention. Deletion from Regen's systems does not automatically delete data independently controlled by WhatsApp/Meta or other parties under their own terms."
          },
          {
            "kind": "request"
          },
          {
            "kind": "note",
            "text": "This button opens your email app. The request is sent only after you press send in that app."
          }
        ]
      },
      {
        "id": "perubahan",
        "title": "Changes to this policy",
        "blocks": [
          {
            "kind": "p",
            "text": "This policy may be updated when our services, data processing practices, or applicable requirements change. The update date appears on this page. We will communicate significant changes in an appropriate way and seek new consent where required."
          },
          {
            "kind": "p",
            "text": "For privacy questions, corrections or requests, contact [[email]]."
          }
        ]
      }
    ]
  },
  "ms": {
    "title": "Dasar Privasi",
    "description": "Cara Regen menggunakan maklumat pelanggan dan perbualan WhatsApp, serta cara meminta akses kepada atau pemadaman data peribadi anda.",
    "intro": "Cara kami menggunakan maklumat anda, menjaga kerahsiaannya dan membantu anda mengurus data peribadi.",
    "back": "Kembali ke Regen",
    "draftDateLabel": "Draf disediakan",
    "updatedLabel": "Kemas kini terakhir",
    "date": "17 September 2026",
    "draftAria": "Status dokumen",
    "draftTitle": "Draf untuk semakan sebelum diterbitkan",
    "draftBody": "Identiti pengendali, penyedia perkhidmatan, penggunaan automasi atau AI, tetapan kuki dan aturan penyimpanan perlu diselaraskan dengan amalan sebenar Regen.",
    "tocAria": "Kandungan dasar privasi",
    "tocTitle": "Pada halaman ini",
    "contactTitle": "Ada soalan tentang data anda?",
    "whatsappPrivacy": "Dasar Privasi WhatsApp",
    "whatsappTerms": "Terma Pemprosesan Data WhatsApp Business",
    "requestSubject": "Permohonan Pemadaman Data Peribadi — Regen",
    "requestButton": "Mohon pemadaman melalui e-mel",
    "sections": [
      {
        "id": "tentang",
        "title": "Tentang dasar ini",
        "blocks": [
          {
            "kind": "p",
            "text": "Dasar ini menerangkan pemprosesan data peribadi oleh Regen Longevity Lab (“Regen”, “kami”) apabila anda melawat laman web kami, menghubungi pasukan melalui WhatsApp atau e-mel, membuat pertanyaan, atau menggunakan perkhidmatan pesanan dan sokongan pelanggan."
          },
          {
            "kind": "p",
            "text": "Regen bertanggungjawab terhadap tujuan penggunaan data yang kami kawal. Perkhidmatan pihak ketiga juga mungkin mempunyai terma privasi sendiri. Soalan tentang dasar ini boleh dihantar ke [[email]]."
          }
        ]
      },
      {
        "id": "data",
        "title": "Maklumat yang kami terima",
        "blocks": [
          {
            "kind": "p",
            "text": "Jenis data bergantung pada maklumat yang anda berikan dan perkhidmatan yang anda gunakan:"
          },
          {
            "kind": "ul",
            "items": [
              "**Identiti dan maklumat hubungan:** nama, nama profil WhatsApp, nombor telefon atau WhatsApp, serta alamat e-mel yang anda berikan.",
              "**Perbualan:** kandungan mesej, pertanyaan, jawapan, lampiran yang anda hantar, masa komunikasi dan catatan susulan khidmat pelanggan.",
              "**Maklumat pesanan:** produk dan pakej yang dipilih, kuantiti, nama penerima, alamat penghantaran, serta pengesahan atau status pembayaran yang diperlukan untuk mengurus pesanan anda.",
              "**Maklumat teknikal:** data yang direkodkan semasa anda mengakses laman web atau perkhidmatan, yang mungkin merangkumi alamat IP, jenis peranti atau pelayar, masa akses dan log ralat bagi operasi serta keselamatan perkhidmatan.",
              "**Keutamaan:** pilihan rantau, bahasa, mata wang, serta pilihan untuk menerima atau menghentikan komunikasi."
            ]
          },
          {
            "kind": "p",
            "text": "Berikan hanya maklumat yang diperlukan untuk permintaan anda. Jangan hantar kata laluan, kod OTP, PIN, nombor penuh kad pembayaran, atau dokumen kesihatan dan identiti yang tidak diperlukan melalui perbualan biasa. Jika maklumat sensitif telah dihantar, anda boleh meminta semakan atau pemadamannya."
          }
        ]
      },
      {
        "id": "tujuan",
        "title": "Cara kami menggunakan data",
        "blocks": [
          {
            "kind": "ul",
            "items": [
              "Menjawab pertanyaan, menerangkan maklumat produk dan pakej, serta membuat susulan terhadap permintaan anda.",
              "Memproses dan mengesahkan pesanan, mengatur penghantaran, serta mengurus permintaan sokongan atau aduan.",
              "Menyimpan sejarah komunikasi yang diperlukan supaya pasukan dapat meneruskan pengendalian permintaan anda.",
              "Menjaga keselamatan laman web dan komunikasi, menyelesaikan gangguan perkhidmatan serta mencegah penyalahgunaan.",
              "Memenuhi kewajipan undang-undang yang berkenaan, menyimpan rekod transaksi atau mengendalikan pertikaian.",
              "Menghantar mesej pemasaran apabila anda telah memberikan persetujuan yang diperlukan, dengan pilihan untuk berhenti menerimanya."
            ]
          },
          {
            "kind": "p",
            "text": "Asas pemprosesan bergantung pada tujuannya: melaksanakan permintaan atau transaksi anda, memenuhi kewajipan undang-undang, mendapatkan persetujuan apabila diperlukan, atau memenuhi kepentingan yang sah dengan mengambil kira hak anda. Melawat laman web atau menghantar pertanyaan tidak bermakna anda secara automatik bersetuju menerima semua mesej pemasaran."
          }
        ]
      },
      {
        "id": "layanan",
        "title": "Perkhidmatan dan penerima data",
        "blocks": [
          {
            "kind": "p",
            "text": "Data boleh diakses oleh ahli pasukan yang mengurus permintaan anda dan penyedia perkhidmatan yang diperlukan untuk tujuan tersebut. Maklumat yang dikongsi dihadkan kepada keperluan perkhidmatan berkenaan:"
          },
          {
            "kind": "ul",
            "items": [
              "**WhatsApp/Meta:** untuk menyediakan dan mengendalikan komunikasi WhatsApp. Pemprosesan oleh platform tertakluk pada terma perkhidmatan dan privasinya, termasuk terma yang terpakai kepada perkhidmatan perniagaan.",
              "**Perkhidmatan laman web dan komunikasi:** penyedia pengehosan, e-mel atau penyimpanan yang digunakan oleh Regen boleh memproses data yang diperlukan untuk mengendalikan perkhidmatan berkaitan.",
              "**Perkhidmatan pesanan:** jika diperlukan untuk pesanan anda, penyedia pembayaran atau penghantaran menerima maklumat yang diperlukan untuk menjalankan tugas mereka.",
              "**Pihak berkuasa:** maklumat boleh diberikan apabila diwajibkan oleh undang-undang atau diperlukan untuk menjawab permintaan yang sah."
            ]
          },
          {
            "kind": "p",
            "text": "Kami tidak menjual data peribadi anda. Kandungan perbualan pelanggan tidak dikongsi dengan pelanggan lain."
          },
          {
            "kind": "p",
            "text": "Maklumat mengenai platform boleh didapati dalam [[whatsappPrivacy]] dan [[whatsappTerms]]."
          }
        ]
      },
      {
        "id": "whatsapp",
        "title": "Komunikasi WhatsApp",
        "blocks": [
          {
            "kind": "p",
            "text": "Apabila anda menghubungi Regen melalui WhatsApp, kami menerima nombor atau identiti hubungan yang disediakan oleh platform serta mesej yang anda hantar kepada kami. Data ini digunakan untuk mengurus komunikasi dan permintaan anda."
          },
          {
            "kind": "p",
            "text": "Anda boleh meminta mesej pemasaran dihentikan dengan membalas “BERHENTI” atau menghantar permintaan melalui e-mel. Penghentian pemasaran tidak menghalang kami daripada menjawab permintaan baharu anda atau menyampaikan maklumat yang diperlukan tentang transaksi yang masih berjalan, mengikut ketetapan yang berkenaan."
          },
          {
            "kind": "p",
            "text": "Jika anda ingin bercakap dengan pasukan kami atau bertanya tentang penggunaan data perbualan, hubungi [[email]]."
          }
        ]
      },
      {
        "id": "cookie",
        "title": "Kuki dan keutamaan laman web",
        "blocks": [
          {
            "kind": "p",
            "text": "Laman web mungkin menggunakan kuki atau storan pelayar untuk mengingati pilihan rantau, bahasa dan mata wang anda serta menyokong fungsi perkhidmatan. Anda boleh mengurus atau memadamkannya melalui tetapan pelayar; sesetengah keutamaan mungkin perlu dipilih semula."
          },
          {
            "kind": "p",
            "text": "Penggunaan teknologi analitik atau pemasaran, jika diaktifkan, perlu diterangkan secara berasingan berserta pilihan persetujuan mengikut ketetapan yang berkenaan. Membuka halaman ini sahaja tidak dianggap sebagai persetujuan."
          }
        ]
      },
      {
        "id": "penyimpanan",
        "title": "Penyimpanan dan pemindahan data",
        "blocks": [
          {
            "kind": "p",
            "text": "Data disimpan selama diperlukan untuk tujuan pengumpulannya. Tempoh penyimpanan mengambil kira penyelesaian perbualan atau pesanan, sokongan selepas transaksi, keperluan penyimpanan rekod yang berkenaan serta penyelesaian aduan atau pertikaian. Data yang tidak lagi diperlukan akan dipadamkan atau dinyahnamakan, tertakluk pada kewajipan penyimpanan yang masih berkuat kuasa."
          },
          {
            "kind": "p",
            "text": "Pemadaman perlu meliputi sistem aktif dan pengurusan salinan sandaran mengikut jadual penyimpanannya. Anda boleh menghubungi kami untuk mendapatkan maklumat lanjut tentang tempoh penyimpanan data yang berkaitan dengan anda."
          },
          {
            "kind": "p",
            "text": "Penyedia perkhidmatan mungkin memproses data di negara yang berbeza daripada lokasi anda. Pemindahan rentas sempadan, jika berlaku, perlu menggunakan asas serta perlindungan yang sesuai mengikut keperluan perlindungan data yang berkenaan."
          }
        ]
      },
      {
        "id": "keamanan",
        "title": "Perlindungan data",
        "blocks": [
          {
            "kind": "p",
            "text": "Kami komited untuk mengehadkan akses data kepada pihak yang memerlukannya bagi tugas perkhidmatan, menjaga kerahsiaan akses tersebut dan melaksanakan langkah keselamatan yang sesuai dengan sifat serta risiko pemprosesan data."
          },
          {
            "kind": "p",
            "text": "Tiada sistem yang dapat menjamin keselamatan mutlak. Jika berlaku insiden yang memerlukan pemberitahuan, kami akan menanganinya dan memaklumkan pihak berkaitan mengikut keperluan yang berkenaan."
          }
        ]
      },
      {
        "id": "hak",
        "title": "Hak dan pilihan anda",
        "blocks": [
          {
            "kind": "p",
            "text": "Mengikut undang-undang yang berkenaan, anda boleh meminta maklumat tentang pemprosesan, akses kepada atau salinan data, pembetulan data yang tidak tepat, penarikan balik persetujuan, penghentian atau pengehadan pemprosesan serta pemadaman data. Hak lain, termasuk bantahan atau pemindahan data, terpakai setakat yang diperuntukkan bagi keadaan anda."
          },
          {
            "kind": "p",
            "text": "Penarikan balik persetujuan tidak membatalkan pemprosesan yang sah sebelum permintaan tersebut. Sesetengah perkhidmatan atau transaksi mungkin tidak dapat diteruskan jika data yang diperlukan tidak tersedia."
          },
          {
            "kind": "p",
            "text": "Jika anda berpendapat data tidak dikendalikan dengan sewajarnya, anda boleh membuat aduan kepada kami. Anda juga boleh menghubungi pihak berkuasa yang berkaitan dalam bidang kuasa anda. Jika data kanak-kanak dihantar kepada kami, ibu bapa atau penjaga boleh menghubungi kami untuk meminta semakan dan tindakan yang sesuai."
          }
        ]
      },
      {
        "id": "penghapusan",
        "title": "Memohon pemadaman data",
        "blocks": [
          {
            "kind": "p",
            "text": "Hantar e-mel ke [[email]] dengan subjek **“Permohonan Pemadaman Data Peribadi — Regen”**."
          },
          {
            "kind": "ol",
            "items": [
              "Sertakan nama dan nombor WhatsApp atau alamat e-mel yang digunakan untuk berkomunikasi dengan Regen.",
              "Jelaskan data yang ingin dipadamkan; nombor pesanan atau anggaran tarikh perbualan boleh membantu kami mencarinya.",
              "Kami mungkin meminta pengesahan yang sewajarnya untuk melindungi data daripada permintaan pihak yang tidak berhak. Jangan hantar salinan dokumen identiti terlebih dahulu kecuali diminta melalui proses yang sesuai.",
              "Kami akan menyemak permintaan dan memaklumkan keputusannya dalam tempoh yang diwajibkan oleh undang-undang yang berkenaan."
            ]
          },
          {
            "kind": "p",
            "text": "Jika sebahagian data masih perlu disimpan, contohnya untuk kewajipan penyimpanan rekod transaksi atau pertikaian yang belum selesai, kami akan menerangkan sebab serta skop penyimpanan tersebut. Pemadaman daripada sistem Regen tidak secara automatik memadamkan data yang dikawal secara berasingan oleh WhatsApp/Meta atau pihak lain mengikut terma mereka sendiri."
          },
          {
            "kind": "request"
          },
          {
            "kind": "note",
            "text": "Butang ini membuka aplikasi e-mel anda. Permintaan hanya dihantar selepas anda menekan hantar dalam aplikasi tersebut."
          }
        ]
      },
      {
        "id": "perubahan",
        "title": "Perubahan kepada dasar ini",
        "blocks": [
          {
            "kind": "p",
            "text": "Dasar ini boleh dikemas kini apabila perkhidmatan, amalan pemprosesan data atau ketetapan yang berkenaan berubah. Tarikh kemas kini dipaparkan pada halaman ini. Perubahan penting akan dimaklumkan melalui cara yang sesuai dan persetujuan baharu akan diminta apabila diperlukan."
          },
          {
            "kind": "p",
            "text": "Untuk soalan, pembetulan atau permintaan berkaitan privasi, hubungi [[email]]."
          }
        ]
      }
    ]
  }
}

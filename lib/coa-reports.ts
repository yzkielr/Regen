/** Original PDFs supplied in the Regen Drive COA folder on 5 October 2026.
 * Server-side allowlist only. These pages are unlisted, not password protected.
 * Keep this registry out of storefront navigation, catalog data and sitemaps.
 */
export interface CoaDocument {
  id: string
  title: string
  filename: string
  pages: number
  sourceId: string
}

export interface CoaReport {
  slug: string
  name: string
  documents: readonly CoaDocument[]
}

export const COA_REPORTS: readonly CoaReport[] = [
  {
    "slug": "tesamorelin",
    "name": "Tesamorelin",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Tesamorelin_COA_Summary.pdf",
        "pages": 1,
        "sourceId": "1jPhW4B6X6Z47JYMU8VnszMTnC5xtEebI"
      }
    ]
  },
  {
    "slug": "semaglutide",
    "name": "Semaglutide",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Semaglutide_COA_Summary.pdf",
        "pages": 3,
        "sourceId": "1Drv9vxZbp4rI4otnA9eisnIp-mafI58Y"
      }
    ]
  },
  {
    "slug": "pt-141",
    "name": "PT-141",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_PT-141_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1zYoq46f_UYSdPgcU-NpvmB2lj8VX8vhR"
      }
    ]
  },
  {
    "slug": "nad-plus",
    "name": "NAD+",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_NAD_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "16HIPD15zcutuoz42vgzKM-FfWSJ34dlC"
      }
    ]
  },
  {
    "slug": "cagrilintide",
    "name": "Cagrilintide",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Cagrilintide_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1QOH8fGBg2xrDDMmFaivkR7DVjyKeOclW"
      }
    ]
  },
  {
    "slug": "5-amino-1mq",
    "name": "5-Amino-1MQ",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_5-Amino-1MQ_COA_Summary.pdf",
        "pages": 1,
        "sourceId": "1kz9G64zqBEldWCm6QrTZrHTGAwAJRtCI"
      }
    ]
  },
  {
    "slug": "tirzepatide",
    "name": "Tirzepatide",
    "documents": [
      {
        "id": "report",
        "title": "COA report",
        "filename": "Regen_Tirzepatide_COA_Report.pdf",
        "pages": 2,
        "sourceId": "1K7ZUuMn1-y8NCVLp6SS66NcVZ4i2Ehw7"
      }
    ]
  },
  {
    "slug": "ghk-cu",
    "name": "GHK-Cu",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_GHK-Cu_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1DXsDhCLEvDO-3BLzd9S7N-gveyeEaI-5"
      }
    ]
  },
  {
    "slug": "ss-31",
    "name": "SS-31 (Elamipretide)",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_SS-31_Elamipretide_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1UGzZKkaZA5p9QdoMQ0jpql7SJBhWOVI6"
      }
    ]
  },
  {
    "slug": "klow80",
    "name": "KLOW80",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_KLOW80_COA_Summary.pdf",
        "pages": 3,
        "sourceId": "18iLIFhYzIAcGF8_LEWc4_vWcSn5dh0_n"
      }
    ]
  },
  {
    "slug": "bpc-157",
    "name": "BPC-157",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_BPC-157_COA_Summary.pdf",
        "pages": 3,
        "sourceId": "1UwbVX21p5RI73TBxUEZfERr2t4G2mkpH"
      }
    ]
  },
  {
    "slug": "semax",
    "name": "Semax",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Semax_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1ApxFCGWw7eDYKk3a6sP2MOZX1mjPKdHh"
      }
    ]
  },
  {
    "slug": "retatrutide",
    "name": "Retatrutide",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Retatrutide_COA_Summary.pdf",
        "pages": 3,
        "sourceId": "1qqySa-wu78GpoCMobOlNkQdkgPFAIOld"
      },
      {
        "id": "janoshik",
        "title": "Janoshik laboratory reports",
        "filename": "Copy of merged janoshik reta regen 5 pages.pdf",
        "pages": 5,
        "sourceId": "1QgT-MuxJ00578XDEYZ0_AXJ87bwaU_Lf"
      }
    ]
  },
  {
    "slug": "tb-500",
    "name": "TB-500",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_TB-500_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1EPGercN0NldwfuhDXAy0WkZbgKkBU0Cm"
      }
    ]
  },
  {
    "slug": "hgh-191aa",
    "name": "HGH 191AA",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_HGH_191AA_COA_Summary.pdf",
        "pages": 3,
        "sourceId": "1o8j02sZ4yo4_MCO8dxpvaiXSM3bIpkru"
      }
    ]
  },
  {
    "slug": "kpv",
    "name": "KPV",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_KPV_COA_Summary.pdf",
        "pages": 1,
        "sourceId": "14lGP5H_vo61PEDG1otcFa88nALVxvLLR"
      }
    ]
  },
  {
    "slug": "dsip",
    "name": "DSIP",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_DSIP_COA_Summary.pdf",
        "pages": 1,
        "sourceId": "1r4EA3ApnnnhzzD1NSRSwo6gGQVBcgzVI"
      }
    ]
  },
  {
    "slug": "ipamorelin",
    "name": "Ipamorelin",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Ipamorelin_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1XaRItHj4EUUCnyJAEXuSke7m6I_zy0RB"
      }
    ]
  },
  {
    "slug": "cjc-1295-with-dac",
    "name": "CJC-1295 With DAC",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_CJC-1295_With_DAC_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1wUYhyXExYn9j87zITMt0t2jCffoB3ihN"
      }
    ]
  },
  {
    "slug": "cjc-1295-without-dac",
    "name": "CJC-1295 Without DAC",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_CJC-1295_Without_DAC_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1l0kVaNn7Daa7X8N8HufvcCERS5h4xeKj"
      }
    ]
  },
  {
    "slug": "mt-2",
    "name": "MT-2",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_MT-2_COA_Summary.pdf",
        "pages": 1,
        "sourceId": "18SjV6rEtofxBY-vDpnR6juKK7f-zh2r9"
      }
    ]
  },
  {
    "slug": "selank",
    "name": "Selank",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Selank_COA_Summary.pdf",
        "pages": 1,
        "sourceId": "1uhf4c8M22lHEDuJKA-OJBN8wdKQZuED7"
      }
    ]
  },
  {
    "slug": "bpc-157-tb-500",
    "name": "BPC-157 + TB-500",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_BPC-157_TB-500_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1GD0UD-sUNLU-6t8IIT-YZu4juuPSnRtf"
      }
    ]
  },
  {
    "slug": "aod-9604",
    "name": "AOD-9604",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_AOD-9604_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1F21Ge5FtY30KUhOrfFlu93EBoDInIYhm"
      }
    ]
  },
  {
    "slug": "epithalon",
    "name": "Epithalon",
    "documents": [
      {
        "id": "report",
        "title": "COA summary",
        "filename": "Regen_Epithalon_COA_Summary.pdf",
        "pages": 2,
        "sourceId": "1fkZTEj75OjuQaa1MSeG7Z87Ud051zHeH"
      }
    ]
  }
]

export function getCoaReport(slug: string): CoaReport | undefined {
  return COA_REPORTS.find((report) => report.slug === slug)
}

export function getCoaDocument(slug: string, id: string): CoaDocument | undefined {
  return getCoaReport(slug)?.documents.find((document) => document.id === id)
}


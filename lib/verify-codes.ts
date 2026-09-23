/**
 * Authenticity verification registry.
 *
 * Each physical Regen product ships with an authenticity card carrying a QR
 * code that points at `/verify/<code>`. The page is unlisted (noindex + not
 * linked anywhere in the site navigation), so it is only reachable by scanning
 * the printed code.
 */

/** An independent link where the customer can re-check a result at source. */
export interface VerifyLink {
  /** Describes what is being verified, e.g. "Endotoxin Test". */
  label: string
  href: string
}

/** A lab report that can be viewed on-screen but never downloaded. */
export interface LabDocument {
  /** Key resolved by the protected /api/lab-document route. */
  id: string
  title: string
  /** Short line describing the method / scope. */
  meta: string
  /** Optional third-party verification links for this report. */
  verifyLinks?: VerifyLink[]
}

/** A single analysis the batch has been screened for. */
export interface TestPoint {
  title: string
  description: string
}

/**
 * The standard Regen analysis panel. Every batch we release is screened
 * against all five of these before it ships.
 */
export const TEST_POINTS: TestPoint[] = [
  {
    title: 'Standard Mass & Purity Analysis',
    description:
      'The full HPLC-UV purity and mass determination run, confirming both concentration and peptide purity.',
  },
  {
    title: 'LCMS Impurities — Identity & Quantity',
    description:
      'Each impurity is identified by its exact mass shift and quantified. You see what they are, not just that they exist.',
  },
  {
    title: 'MS Identity — Molecular Confirmation',
    description:
      'Molecular identity confirmed by high-resolution mass spectrometry, with error reported in ppm against the theoretical mass.',
  },
  {
    title: 'Heavy Metals Screen',
    description:
      'Screened for heavy metal contamination against pharmacopoeial limits.',
  },
  {
    title: 'Endotoxin',
    description:
      'LAL chromogenic assay. Quantifies bacterial endotoxin to USP <85> standards.',
  },
]

/** Key results pulled from the batch reports, shown as verified highlights. */
export interface LabResult {
  label: string
  value: string
}

export interface ProductRecord {
  /** The unique verification code printed on the authenticity card. */
  code: string
  /** Full product name as it should be presented to the customer. */
  product: string
  batch: string
  manufactured: string
  expiry: string
  /** Independent laboratory that ran the panel. */
  lab: string
  /** Date the analysis was conducted. */
  tested: string
  results: LabResult[]
  /** Reports viewable on-screen for this batch. */
  documents: LabDocument[]
}

/** Reports for the June 2026 Retatrutide 10 mg batch. */
const RETATRUTIDE_DOCUMENTS: LabDocument[] = [
  {
    id: 'janoshik-rt60-purity-identity-endotoxin',
    title: 'Janoshik Analytical — Purity, Identification & Endotoxin',
    meta: 'HPLC-UV purity, MS identification and LAL endotoxin assay',
    // Both results can be re-checked directly on Janoshik's own website, so
    // the customer never has to take our copy of the report at face value.
    verifyLinks: [
      {
        label: 'Janoshik Peptide Verification & Purity',
        href: 'https://janoshik.com/tests/216978-LORENIC_RT60_2EYCBQPL5YFC',
      },
      {
        label: 'Endotoxin Test',
        href: 'https://janoshik.com/tests/216979-LORENIC_RT60_BBWJ9VNLP5ML',
      },
    ],
  },
  {
    id: 'retatrutide-10mg-purity',
    title: 'Certificate of Analysis — Mass & Purity',
    meta: 'Standard Peptide Mass / Purity by HPLC-UV',
  },
  {
    id: 'retatrutide-10mg-endotoxin',
    title: 'Endotoxin Report',
    meta: 'LAL chromogenic assay, USP <85>',
  },
]

const RETATRUTIDE_RESULTS: LabResult[] = [
  { label: 'Purity', value: '99.78%' },
  { label: 'Measured amount', value: '11.18 mg' },
  { label: 'Endotoxin', value: 'PASS' },
]

/** Shared fields for every code tied to the June 2026 Retatrutide batch. */
const RETATRUTIDE_BATCH = {
  product: 'Regen Retatrutide 10mg',
  batch: 'LREGENRT03',
  manufactured: '06 / 2026',
  expiry: '06 / 2028',
  lab: 'Janoshik and Uzorak',
  tested: '16 July 2026',
  results: RETATRUTIDE_RESULTS,
  documents: RETATRUTIDE_DOCUMENTS,
} satisfies Omit<ProductRecord, 'code'>

const RECORDS: ProductRecord[] = [
  { code: 'LRN-RETA-0001', ...RETATRUTIDE_BATCH },
  { code: 'VF0601RT', ...RETATRUTIDE_BATCH },
  // Primary code encoded on the printed authenticity card QR.
  { code: 'RETA10', ...RETATRUTIDE_BATCH },
]

/** Every document id that may be served, used to reject arbitrary paths. */
export const ALLOWED_DOCUMENT_IDS = new Set(
  RECORDS.flatMap((r) => r.documents.map((d) => d.id)),
)

/** Normalize QR/manual input so casing and stray spaces never cause misses. */
export function normalizeCode(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().toUpperCase()
  } catch {
    return raw.trim().toUpperCase()
  }
}

/** Returns the matching product record, or null if the code is unrecognized. */
export function verifyCode(raw: string): ProductRecord | null {
  const code = normalizeCode(raw)
  return RECORDS.find((r) => r.code.toUpperCase() === code) ?? null
}

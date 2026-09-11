// Shared product catalog data used by the homepage catalog, product cards,
// and the dedicated product pages.

import type { RegionId } from './regions'

export type VariantId = 'basic' | 'cartridge' | 'pen'

export interface ProductVariant {
  id: VariantId
  label: string
  note: string
}

// Display copy is localized in product-copy.ts; market prices belong in
// region-pricing.ts.
export const VARIANTS: ProductVariant[] = [
  {
    id: 'basic',
    label: 'Basic Package',
    note: 'Basic package for laboratory research. Confirm package contents with our team.',
  },
  {
    id: 'cartridge',
    label: 'Cartridge Package',
    note: 'Refill cartridge for the Regen Pen device.',
  },
  {
    id: 'pen',
    label: 'Pen Package',
    note: 'Pre-filled pen package for laboratory research.',
  },
]

// The same three packages are offered in every region. Prices vary by region.
export function getProductVariants(_regionId: RegionId): ProductVariant[] {
  return VARIANTS
}

export interface Product {
  slug: string
  name: string
  category: string
  image: string
  /** Short supporting line shown on cards. */
  tagline: string
  /** Fuller description shown on the product page. */
  description: string
  /** Dosing reference printed on the pre-filled cartridge label. */
  dosage: string
}

export const products: Product[] = [
  {
    slug: 'retatrutide',
    name: 'Retatrutide 10mg',
    category: 'FAT LOSS & MUSCLE GAIN',
    image: '/products/retatrutide.jpeg',
    tagline: 'Triple-receptor agonist studied for body composition.',
    description:
      'Retatrutide is a triple-receptor (GLP-1 / GIP / glucagon) agonist studied in research settings for its effects on energy balance, appetite signalling, and body composition. Supplied as a 10mg research cartridge.',
    dosage: '200 clicks (20 clicks = 1 mg)',
  },
  {
    slug: 'cjc-1295-ipamorelin',
    name: 'CJC-1295 (No DAC) 5mg + Ipamorelin 5mg',
    category: 'MUSCLE GAIN & GROWTH',
    image: '/products/cjc1295-ipamorelin.jpeg',
    tagline: 'GHRH + ghrelin analog blend for growth hormone research.',
    description:
      'A synergistic blend of CJC-1295 (No DAC), a GHRH analog, and Ipamorelin, a selective growth hormone secretagogue. Studied together for pulsatile growth hormone release, recovery, and lean tissue support.',
    dosage: '200 clicks (20 clicks = 1 mg)',
  },
  {
    slug: 'klow80',
    name: 'KLOW80',
    category: 'RECOVERY & HEALING BLEND',
    image: '/products/klow80.jpeg',
    tagline: 'Multi-peptide blend studied for repair and recovery.',
    description:
      'KLOW80 is a multi-peptide recovery blend combining regenerative and reparative compounds. Researched for tissue repair, skin quality, and overall recovery support in a single convenient format.',
    dosage: '200 clicks',
  },
  {
    slug: 'mots-c',
    name: 'MOTS-C 10mg',
    category: 'METABOLIC & LIFESPAN',
    image: '/products/mots-c.jpeg',
    tagline: 'Mitochondrial-derived peptide for metabolic research.',
    description:
      'MOTS-C is a mitochondrial-derived peptide studied for its role in metabolic regulation, insulin sensitivity, and cellular energy. A compound of growing interest in metabolic and longevity research.',
    dosage: '200 clicks (100 clicks = 5 mg)',
  },
  {
    slug: 'nad-plus',
    name: 'NAD+ 500mg',
    category: 'REGENERATION & LIFESPAN',
    image: '/products/nad-plus.jpeg',
    tagline: 'Coenzyme central to cellular energy and repair.',
    description:
      'NAD+ (nicotinamide adenine dinucleotide) is a coenzyme central to cellular energy production and DNA repair. Widely studied in regeneration and lifespan research at a high 500mg concentration.',
    dosage: '200 clicks (20 clicks = 50 mg)',
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin 10mg',
    category: 'FAT LOSS & GROWTH',
    image: '/products/tesamorelin.jpeg',
    tagline: 'GHRH analog studied for visceral fat and GH support.',
    description:
      'Tesamorelin is a stabilized GHRH analog studied for its effects on visceral fat reduction and growth hormone stimulation. Supplied as a 10mg research cartridge.',
    dosage: '200 clicks (40 clicks = 2 mg)',
  },
  {
    slug: 'bpc-157',
    name: 'BPC-157 10mg',
    category: 'RECOVERY & REPAIR',
    image: '/products/bpc-157.jpeg',
    tagline: 'Body protection compound studied for tissue repair.',
    description:
      'BPC-157 is a stable gastric pentadecapeptide studied extensively for tissue repair, tendon and ligament recovery, and gut health in preclinical research.',
    dosage: '200 clicks (10 clicks = 0.5 mg)',
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu 100mg',
    category: 'SKIN & REGENERATION',
    image: '/products/ghk-cu.jpeg',
    tagline: 'Copper peptide studied for skin and regeneration.',
    description:
      'GHK-Cu is a naturally occurring copper tripeptide studied for skin regeneration, collagen synthesis, and wound healing. Supplied at a high 100mg concentration for research use.',
    dosage: '200 clicks (40 clicks = 2 mg)',
  },
]

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  return products.filter((p) => p.slug !== slug).slice(0, limit)
}

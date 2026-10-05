# Regen Longevity Lab

## Unlisted COA pages

The 26 original PDFs supplied on 5 October 2026 are stored in
`lab-documents/coa/` and grouped into 25 product pages by `lib/coa-reports.ts`.
Retatrutide includes its summary and the separate five-page Janoshik report.
Documents are served from `/coa/[code]/document/[document]` using a filename
allowlist; production tracing includes these PDFs in the server route bundle.

These URLs have no links from the storefront, menus, product cards or sitemap.
Pages and PDFs send `X-Robots-Tag: noindex, nofollow, noarchive, noimageindex`;
pages also include robots metadata. Crawling is allowed so search engines can
read the noindex instruction. They are unlisted public links: anyone with a URL
can open it, without a login. The existing coded COA and `/verify/reta10` routes
retain their previous behavior.

After deploying this project to `https://www.regenlongevitylab.com`, append:

| Product | URL path |
| --- | --- |
| Tesamorelin | `/coa/tesamorelin` |
| Semaglutide | `/coa/semaglutide` |
| PT-141 | `/coa/pt-141` |
| NAD+ | `/coa/nad-plus` |
| Cagrilintide | `/coa/cagrilintide` |
| 5-Amino-1MQ | `/coa/5-amino-1mq` |
| Tirzepatide | `/coa/tirzepatide` |
| GHK-Cu | `/coa/ghk-cu` |
| SS-31 (Elamipretide) | `/coa/ss-31` |
| KLOW80 | `/coa/klow80` |
| BPC-157 | `/coa/bpc-157` |
| Semax | `/coa/semax` |
| Retatrutide | `/coa/retatrutide` |
| TB-500 | `/coa/tb-500` |
| HGH 191AA | `/coa/hgh-191aa` |
| KPV | `/coa/kpv` |
| DSIP | `/coa/dsip` |
| Ipamorelin | `/coa/ipamorelin` |
| CJC-1295 With DAC | `/coa/cjc-1295-with-dac` |
| CJC-1295 Without DAC | `/coa/cjc-1295-without-dac` |
| MT-2 | `/coa/mt-2` |
| Selank | `/coa/selank` |
| BPC-157 + TB-500 | `/coa/bpc-157-tb-500` |
| AOD-9604 | `/coa/aod-9604` |
| Epithalon | `/coa/epithalon` |

Run `npm run test:coa` to check the registry and file coverage. To add or replace
a report, update its registered filename and page count as well as the PDF.
`scripts/prepare-coa-pdf.mjs` prepares the PDF.js assets after a PDF.js update.

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Regional websites

Each market has its own home page and product URLs. The header and footer region
buttons change market without leaving the current product. New visitors to `/`
see a region chooser; return visits use the saved `regen-region` preference.
A direct regional URL always takes precedence over a saved preference.

On a first visit to `/`, the site can suggest a region from the connection's
approximate country using Vercel's
[`x-vercel-ip-country` header](https://vercel.com/docs/headers/request-headers#x-vercel-ip-country).
The visitor must accept the suggestion before navigating; the site never
automatically changes region based on detected country. Dismissing it hides the
suggestion for the browser session while leaving all seven choices available.
Only an explicit regional visit/selection is saved as the region preference.

Detection is country-level only: this feature does not request GPS permission,
store raw IP addresses, or call an external IP lookup service. EU member countries
map to the EU storefront; the UK is separate. Unsupported/unknown countries,
localhost, and hosting without Vercel country headers show the ordinary chooser.
VPNs can affect the suggested country. `lib/region-detection.ts` contains the
mapping and detection guards; the root page is rendered per request, not cached
as one visitor's personalized suggestion for everyone.

| Region | Home | Language | Currency |
| --- | --- | --- | --- |
| Australia | `/au` | English | AUD |
| European Union | `/eu` | English | EUR |
| United States | `/us` | English | USD |
| United Kingdom | `/uk` | English | GBP |
| Singapore | `/sg` | English | SGD |
| Malaysia | `/my` | Bahasa Melayu | MYR |
| Indonesia | `/id` | Bahasa Indonesia | IDR |

For example, `/my/product/retatrutide` shows the Malay product page with MYR
settings. Original `/product/[slug]` links redirect to the saved region, with the
previous EUR storefront as the fallback. Unlisted `/verify` QR-code URLs and
lab-document endpoints are unchanged.

Region definitions live in `lib/regions.ts`. English, Malay and Indonesian copy
lives in `lib/home-copy.ts`, `lib/product-copy.ts` and `lib/support-copy.ts`.
All seven regional home pages use the same English `HOME_TAGLINE`:
“European research-grade peptides, delivered with precision.” Supporting copy
stays local: conversational Indonesian and Malaysian Malay, with familiar terms
such as peptides, batch, COA, cartridge and customer support left in English.

The Indonesian review cards are natural paraphrases of the nine English/EU-site
review texts, preserving their topics and order. Their Indonesian names, ages
and healthcare/professional roles are **fictional sample profiles, not verified
customer identities or healthcare endorsements**. The section notice and every
card explicitly label this localization as sample copy; no stars, aggregate
rating or verified-review count are shown. Use permissioned, authentic feedback
before presenting these as Indonesian customer reviews, and do not remove the
fictional-profile disclosures or misattribute the source reviews. English and
Malay review copy is unchanged.

The validated URL also sets the server-rendered HTML language through the
[Next.js request-header API](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
Set `NEXT_PUBLIC_SITE_URL` to the public production origin for canonical links;
otherwise the Vercel production URL is used, or localhost during local development.

### Frosted quality carousel

Each regional hero ends with a full-width, translucent scrolling quality strip
before the catalog. The stationary Regen-green/orange haze and frosted surface
are separate from the moving text, so the text and sparkle icons remain sharp.
`lib/trust-carousel-copy.ts` owns the four English brand labels and the localized
EN/MS/ID accessibility controls. The labels are **Endotoxin tested**, **Research
grade**, **Batch-specific COA**, and **HPLC tested**; no customer count, ownership,
delivery, sterility, or blanket purity-percentage claim is imported from the
visual reference.

The strip has a pause/resume button and pauses temporarily while hovering over
the moving text. A reduced-motion preference removes the animation and shows
all four items in a wrapping static list. Only one copy is exposed to screen
readers; the second is a decorative duplicate for the seamless loop. The
animation and frosted styling are scoped to `.trust-carousel` in `app/globals.css`.
No reference-site image or recording is shipped with the website.

### Prices and catalog assets

`lib/region-pricing.ts` is the single source for approved local prices. Indonesian
prices are product-specific, matched to the exact catalog strength from the
[`idr pricing` sheet](https://docs.google.com/spreadsheets/d/1kBjIQ498O3CDZ3d2GzyNS8zG6SJDJbM5A7kwonf6qQk/edit?gid=0#gid=0)
on 2026-08-30. `INDONESIAN_PRODUCT_PRICES` uses column C (**Paket Basic**),
column D (**Cartridge Set**) and column E (**complete Pen package**), including
the evaluated numeric results of the sheet formulas. This is a checked-in price
snapshot, not a live Sheets sync.

| Existing product | Source row | Paket Basic (IDR) | Cartridge Set (IDR) | Complete Pen package (IDR) |
| --- | --- | ---: | ---: | ---: |
| Retatrutide 10mg | 4 | 999,000 | 1,199,000 | 1,799,000 |
| Tesamorelin 10mg | 5 | 1,372,000 | 1,572,000 | 2,172,000 |
| GHK-Cu 100mg | 8 | 1,078,000 | 1,278,000 | 1,878,000 |
| NAD+ 500mg | 9 | 1,162,000 | 1,362,000 | 1,962,000 |
| KLOW80 (KLOW 80mg in the sheet) | 11 | 1,800,000 | 2,000,000 | 2,600,000 |
| CJC-1295 (No DAC) 5mg + Ipamorelin 5mg | 12 | 1,098,000 | 1,298,000 | 1,898,000 |
| MOTS-C 10mg | 13 | 1,176,000 | 1,376,000 | 1,976,000 |
| BPC-157 10mg | 19 | 1,162,000 | 1,362,000 | 1,962,000 |

Indonesian catalog and recommended cards show the Basic starting price, e.g.
**mulai dari IDR 999,000 / paket basic**, while retaining each product's existing
cartridge photo. IDR prices use comma grouping to match this display style.
Indonesian detail pages start with Basic selected and offer all three packages;
the chosen package name also follows through to the product inquiry. Basic uses
the individual cartridge photo with an explicit illustration notice, not a
claimed photo of Basic contents. Its selection does not show the cartridge's
click-label reference. The formats overview has a labelled Basic photo placeholder
until actual package photography is supplied; package contents are not inferred.

Additional strengths, products not already in the catalog, and the separate
coming-soon sheet are not listed by this pricing update. An unmapped Indonesian
product or format shows a pricing inquiry without a starting-price claim, never
the old flat IDR 2,500,000 / 3,500,000 fallback. The catalog, detail page, format
options and recommended product cards use the same product-aware price helpers.

Other regions are unchanged: EUR prices remain 143 / 200 for cartridge / pen;
AUD, USD, GBP, SGD and MYR show a localized pricing inquiry, not a guessed
conversion. Basic is offered only in Indonesia via `getProductVariants`; the
other six regions retain their two formats. Replace a market's `null` values
only with approved local amounts.

Changing region does not assert local product approval or guaranteed shipping.
The team confirms availability, shipping and final pricing. The existing catalog
photos remain temporary assets until Regen product photography is supplied.

### Verification

With Node.js 24 and dependencies installed:

```bash
npm run test:regions
npx tsc --noEmit --incremental false
npm run build
```

The tests cover all seven region/language/currency mappings, regional URL
construction, product-preserving switches, invalid IDs, localized catalog data,
and the distinction between approved prices and regional pricing inquiries.
Country-detection and entry tests also cover all 27 EU members, unsupported
countries, saved-choice priority, and the dismissal/hosting guards. Component
tests cover all seven suggestion links, explicit acceptance, session-only
dismissal, keyboard focus and uniform region-card sizing.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_2etLWhwVkjtaWGv6qMSCs3fyDb7L)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

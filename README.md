# Regen Longevity Lab

## Workspace layout

| Folder | Purpose |
| --- | --- |
| `app/`, `components/`, `lib/` | Storefront, admin frontend and application logic |
| `public/` | Images, fonts and other assets used by the website |
| `lab-documents/coa/` | Original COA PDFs served by the website; keep these files |
| `scripts/`, `tests/`, `workflows/` | Maintenance scripts, regression checks and active background workflows |
| `sites/regen-inbox/` | Private admin working source, including unpublished changes |
| `sites/regen-refresh/` | Private admin source checkout used for Sites deployments |
| `artifacts/` | Local diagnostic tools, deployment records, patches and business-document extracts |

The private `sites/` checkouts and local `artifacts/` are excluded from this
repository and the storefront deployment. Publish the private backend only
through its own deployment workflow. Keep source checkouts with pending changes.
Generated dependencies and caches (`node_modules/`, `.next/`, `.swc/`) stay at
their framework-required paths and are excluded from Git.

Workspace cleanup on 14 October 2026 removed retired Kommo artifacts, temporary
browser profiles, obsolete deployment copies and one-off implementation scripts.
Application source, credentials, original documents and pending work were kept.
The local deletion inventory is `artifacts/workspace-cleanup-2026-10-14.json`.

## Private Regen Admin

`/admin` requires the owner-configured username and password. Its client is a
scoped copy of the existing Regen Admin interface; all records and files remain
in the same private Sites workspace. `/admin/login` is public; dashboard APIs
validate the server-side session before accessing that workspace.

Set `REGEN_ADMIN_BACKEND_ACCESS` as a **sensitive Production environment variable**
in this Vercel project. Never use a `NEXT_PUBLIC_` prefix. It is the private Sites
gateway credential; the server relay has a fixed destination and route allowlist.
Deploy the backend authentication migration before deploying this frontend.

The owner creates or resets the account at
`https://regen-inbox.hello-wearology.chatgpt.site/admin-access` using existing
ChatGPT owner sign-in. Passwords are salted scrypt hashes; random session tokens
are stored as hashes. HttpOnly, SameSite=Strict session cookies are restricted
to `/admin` and Secure in production. Sessions expire after 30 minutes without
user interaction or eight hours maximum. Logout or password reset revokes them.
Background polling does not refresh inactivity. Login attempts are rate limited.

The new domain accepts request bodies up to 4 MB, including upload overhead;
larger knowledge documents can still be parsed locally and saved as text.
The original private Sites URL and its server-to-server n8n connection remain.

Run `node --experimental-strip-types --test lib/admin-gateway-policy.test.mjs`,
`npx tsc --noEmit --incremental false`, and `npm run build`. The separate Site
checkout contains password tests and the additive database migration. After
changing shared UI in that checkout, run `node scripts/sync-admin-ui.mjs` and
commit the generated client files; server implementation and data are excluded.

## Flip invoice branch

The public Flip Accept Payment callback is
`https://www.regenlongevitylab.com/api/flip/webhook`. It preserves Flip's original
form body, forwards it to the private Regen backend, and wakes the durable worker
after the authenticated payment has been stored. The backend owns invoice IDs,
payment reconciliation, bot drafts and warehouse delivery; see
`sites/regen-inbox/FLIP.md` for setup and the WhatsApp delivery requirements.

Configure `REGEN_FLIP_LIVE_KEY` and `REGEN_FLIP_LIVE_CALLBACK_TOKEN` as **Sites
server secrets**, using the same Flip for Business account. No Flip secret is
required in the public frontend. Until those secrets and the callback in Flip
are configured, the new branch remains unavailable for live invoice creation.

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

`lib/region-pricing.ts` contains the normal website prices from the supplied
`regen pricing web.xlsx`, tab **idr pricing v2**, checked on 10 October 2026.
The 19 rows (6–24) cover 16 catalog products and the additional selectable
Tesamorelin 20mg, GHK-Cu 50mg and NAD+ 1000mg strengths.

| Currency / region | Basic normal price | Cartridge normal price | Pen normal price |
| --- | --- | --- | --- |
| EUR / EU | C | L | U |
| GBP / UK | D | M | V |
| AUD / AU | E | N | W |
| SGD / SG | F | O | X |
| USD / US | G | P | Y |
| MYR / MY | H | Q | Z |
| IDR / ID | J | S | AB |

Only normal prices are published. After-voucher/discount columns I, R and AA
and voucher-amount columns K, T and AC are not website prices and are not
included in the runtime price data. There is no currency conversion or
voucher calculation in the website.

The independent source snapshot in `lib/fixtures/pricing-v2.json` records the
workbook SHA-256, row labels, strength, normal-price columns and all 399 slots.
The 350 numeric amounts are positive whole values. The remaining 49 slots
stay unpriced (blank, out of stock or unavailable). Normal-price formula
results were checked against their precedents and cached workbook values.

GHK-Cu 50mg Basic has a source formula error at J9 because I9 says
`out of stock`; the IDR website keeps it sold out with no numeric price.
Semaglutide and Cagrilintide Basic are also sold out in IDR. Their foreign
Basic prices are blank and remain inquiries. Semax and Selank have only
priced Basic packages; Cartridge and Pen are unavailable in every region.

Catalog cards, recommendations and the carousel use the first priced package.
Product details show the chosen strength and package price. For example,
Retatrutide IDR normal prices are 2,099,000 / 2,799,000 / 3,799,000 for
Basic / Cartridge / Pen. Formatting uses comma grouping for IDR.
The existing catalog, package images, strength selectors and consultation
flows are preserved.

Run the pricing checks with Node.js 22.6+:
```bash
node --experimental-strip-types --test lib/region-pricing.test.mjs lib/product-pricing-ui.test.mjs
```
They compare every source slot, independently check the screenshot's IDR
amounts, and exercise real product components for catalog prices, package
selection, strength changes, region switches, photo selection and unavailable
formats. Update this source snapshot and its checks when approved prices change.


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

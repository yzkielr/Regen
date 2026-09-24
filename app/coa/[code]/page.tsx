/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { notFound } from 'next/navigation'
import { PdfPages } from './pdf-pages'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--coa-font-body' })
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--coa-font-display',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Product Authenticity — Regen',
  description: 'Retatrutide batch documentation and laboratory reports.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: 'no-referrer',
}

// The owner confirmed that Lorenic is the former brand of Regen.
// These are the reference page's batch-level values, sourced from its
// Uzorak reports. The separate Janoshik reports retain their own values.
// This shared product-link code is not an individual-unit serial lookup.
const product = {
  name: 'Regen Retatrutide 10mg',
  purity: '99.78%',
  measuredAmount: '11.18 mg',
  endotoxin: 'PASS',
  batch: 'LREGENRT03',
  manufactured: '06 / 2026',
  expiry: '06 / 2028',
  tested: '16 July 2026',
  laboratory: 'Janoshik and Uzorak',
}

const tests = [
  {
    title: 'Standard Mass & Purity Analysis',
    body: 'HPLC-UV analysis measures the peptide amount and purity, checking both concentration and sample composition.',
  },
  {
    title: 'LCMS Impurities — Identity & Quantity',
    body: 'Impurities are identified by their mass differences and measured individually, providing information about their identity and quantity.',
  },
  {
    title: 'MS Identity — Molecular Confirmation',
    body: 'High-resolution mass spectrometry checks molecular identity against the theoretical mass, with the difference expressed in ppm.',
  },
  {
    title: 'Heavy Metals Screen',
    body: 'Screening checks for heavy metal contamination against pharmacopoeial limits.',
  },
  {
    title: 'Endotoxin',
    body: 'A chromogenic LAL assay measures bacterial endotoxin according to USP <85>.',
  },
]

const verificationLinks = [
  {
    label: 'Janoshik Peptide Verification & Purity',
    href: 'https://verify.janoshik.com/tests/216978-LORENIC_RT60_2EYCBQPL5YFC',
  },
  {
    label: 'Endotoxin Test',
    href: 'https://verify.janoshik.com/tests/216979-LORENIC_RT60_BBWJ9VNLP5ML',
  },
]

function Check({ large = false }: { large?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={large ? 'coa-check-drawing' : 'coa-small-check'}>
      {!large && <circle cx="50" cy="50" r="50" fill="currentColor" />}
      <path d="M26 51.5 L43 68 L74 35" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  )
}

const pdfTitles: Partial<Record<number, string>> = {
  2: 'Janoshik chromatogram',
  6: 'Uzorak mass and purity report',
  7: 'Uzorak endotoxin report',
}

function ReportImages({ code, start, end, label }: { code: string; start: number; end: number; label: string }) {
  return (
    <div className="coa-report-pages">
      {Array.from({ length: end - start }, (_, index) => start + index + 1).map((image, index) => {
        const src = `/coa/${encodeURIComponent(code)}/image/${image}`
        const pdfTitle = pdfTitles[image]

        // Slots 2, 6 and 7 use original PDFs. Other slots remain images.
        if (pdfTitle) {
          return (
            <PdfPages key={`${label}-${index}`} src={src} title={pdfTitle} />
          )
        }

        return (
          <img
            key={`${label}-${index}`}
            src={src}
            referrerPolicy="no-referrer"
            alt={`${label} — page ${index + 1}`}
            width={590}
            height={start >= 5 ? 833 : 834}
            loading="lazy"
            decoding="async"
          />
        )
      })}
    </div>
  )
}

export default async function CoaPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const expectedCode = process.env.REGEN_RETATRUTIDE_COA_CODE

  // Preserve the existing physical-product link and fail closed.
  // Keep this environment variable server-only; never use NEXT_PUBLIC_.
  if (!expectedCode || !/^[A-Za-z0-9_-]{32,128}$/.test(expectedCode) || code !== expectedCode) {
    notFound()
  }

  return (
    <main lang="en" className={`regen-coa ${inter.variable} ${poppins.variable}`}>
      <style>{STYLES}</style>
      <div className="coa-container">
        <article className="coa-card" aria-labelledby="coa-title">
          <header className="coa-intro">
            <div className="coa-status-icon" role="img" aria-label="Authentic product verified">
              <span className="coa-status-pulse" />
              <span className="coa-status-halo" />
              <span className="coa-status-disc" />
              <Check large />
            </div>
            <h1 id="coa-title">Authentic product verified.</h1>
            <p className="coa-identifies">Your product identifies as</p>
            <p className="coa-product-name">{product.name}</p>
            <dl className="coa-stats">
              <div><dt>Purity</dt><dd>{product.purity}</dd></div>
              <div><dt>Measured amount</dt><dd>{product.measuredAmount}</dd></div>
              <div><dt>Endotoxin</dt><dd>{product.endotoxin}</dd></div>
            </dl>
          </header>

          <div className="coa-content">
            <h2>This batch has been tested for:</h2>
            <ul className="coa-tests">
              {tests.map((test) => (
                <li key={test.title}>
                  <Check />
                  <div><p className="coa-test-title">{test.title}</p><p className="coa-test-body">{test.body}</p></div>
                </li>
              ))}
            </ul>

            {/* Native disclosure keeps PDF viewers and report images mounted when closed. */}
            <details className="coa-documents" open>
              <summary>
                <span className="coa-summary-label"><DocumentIcon />COA and other Lab testing documents</span>
                <svg className="coa-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </summary>
              <div className="coa-document-groups">
                <section className="coa-report-group" aria-labelledby="janoshik-heading">
                  <div>
                    <h3 id="janoshik-heading">Janoshik Analytical — Purity, Identification &amp; Endotoxin</h3>
                    <p className="coa-report-subtitle">HPLC-UV purity, MS identification and LAL endotoxin assay</p>
                  </div>
                  <ReportImages code={code} start={0} end={5} label="Janoshik Analytical — Purity, Identification & Endotoxin" />
                  <div className="coa-verification-links">
                    {verificationLinks.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer" aria-label={`${link.label} — opens in a new tab`}>
                        <span><strong>{link.label}</strong><small>Verify on Janoshik website</small></span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                      </a>
                    ))}
                  </div>
                </section>

                <section className="coa-report-group" aria-labelledby="purity-heading">
                  <div><h3 id="purity-heading">Certificate of Analysis — Mass &amp; Purity</h3><p className="coa-report-subtitle">Standard Peptide Mass / Purity by HPLC-UV</p></div>
                  <ReportImages code={code} start={5} end={6} label="Certificate of Analysis — Mass & Purity" />
                </section>

                <section className="coa-report-group" aria-labelledby="endotoxin-heading">
                  <div><h3 id="endotoxin-heading">Endotoxin Report</h3><p className="coa-report-subtitle">LAL chromogenic assay, USP &lt;85&gt;</p></div>
                  <ReportImages code={code} start={6} end={7} label="Endotoxin Report" />
                </section>
              </div>
            </details>
          </div>

          <div className="coa-batch">
            <dl>
              <div><dt>Batch</dt><dd>{product.batch}</dd></div>
              <div><dt>Manufactured</dt><dd>{product.manufactured}</dd></div>
              <div><dt>Expiry</dt><dd>{product.expiry}</dd></div>
              <div><dt>Tested</dt><dd>{product.tested}</dd></div>
              <div className="coa-laboratory"><dt>Laboratory</dt><dd>{product.laboratory}</dd></div>
            </dl>
          </div>
        </article>
      </div>
      <footer className="coa-footer">
        <span className="coa-wordmark">Regen<span aria-hidden="true">.</span></span>
        <p>Regenerative Peptide Labs &amp; Research</p>
      </footer>
    </main>
  )
}

const STYLES = `
.regen-coa{--coa-primary:#003F35;--coa-accent:#F26A21;--coa-ink:#142a24;--coa-muted:#677a73;--coa-border:#d6e2dc;--coa-soft:#edf4f0;display:flex;min-height:100dvh;flex-direction:column;align-items:center;justify-content:center;background:var(--coa-primary);padding:40px 16px;color:var(--coa-ink);font-family:var(--coa-font-body),Arial,sans-serif;font-size:16px;line-height:24px;-webkit-font-smoothing:antialiased}
.regen-coa *{box-sizing:border-box}.regen-coa :is(h1,h2,h3,p,ul,dl,dd){margin:0}.regen-coa :is(h1,h2,h3){font-family:var(--coa-font-display),Arial,sans-serif}.regen-coa a{color:inherit;text-decoration:none}
.coa-container{width:100%;max-width:672px}.coa-card{overflow:hidden;border:1px solid var(--coa-border);border-radius:26.4px;background:#fff;box-shadow:0 20px 25px -5px #0000001a,0 8px 10px -6px #0000001a}
.coa-intro{display:flex;flex-direction:column;align-items:center;padding:40px 24px 32px;text-align:center}.coa-status-icon{position:relative;display:flex;width:128px;height:128px;align-items:center;justify-content:center;flex-shrink:0}
.coa-status-pulse,.coa-status-halo,.coa-status-disc{position:absolute;border-radius:50%;background:var(--coa-primary)}.coa-status-pulse{inset:0;opacity:0;animation:coa-ring 1.1s ease-out both}.coa-status-halo{inset:8px;opacity:.12}.coa-status-disc{inset:16px;box-shadow:0 10px 15px -3px #003f354d,0 4px 6px -4px #003f354d;animation:coa-arrive .5s cubic-bezier(.22,1,.36,1) both}.coa-check-drawing{position:relative;width:64px;height:64px}.coa-check-drawing path{stroke-dasharray:1;stroke-dashoffset:0;animation:coa-draw .55s ease-out .15s both}
.coa-intro h1{margin-top:24px;font-size:24px;font-weight:700;line-height:32px;text-wrap:balance;color:var(--coa-primary)}.coa-intro .coa-identifies{margin-top:16px;color:var(--coa-muted);font-size:14px;line-height:20px}.coa-intro .coa-product-name{margin-top:6px;font-family:var(--coa-font-display),Arial,sans-serif;font-size:20px;line-height:28px;font-weight:700;color:var(--coa-primary);text-wrap:balance}
.coa-intro .coa-stats{display:grid;width:100%;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:24px}.coa-stats>div{display:flex;flex-direction:column;gap:2px;border-radius:16.8px;background:var(--coa-soft);padding:12px 16px}.coa-stats dt{font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.05em;color:var(--coa-muted)}.coa-stats dd{font-family:var(--coa-font-display),Arial,sans-serif;font-size:16px;line-height:24px;font-weight:700}
.coa-content{border-top:1px solid var(--coa-border);padding:32px 24px}.coa-content h2{font-size:16px;line-height:24px;font-weight:600}.coa-content .coa-tests{display:flex;flex-direction:column;gap:16px;list-style:none;padding:0;margin-top:16px}.coa-tests li{display:flex;align-items:flex-start;gap:12px}.coa-small-check{height:20px;width:20px;margin-top:2px;flex-shrink:0;color:var(--coa-primary)}.coa-test-title{font-size:14px;line-height:20px;font-weight:600}.coa-test-body{margin-top:2px!important;font-size:14px;line-height:22.75px;color:var(--coa-muted)}
.coa-documents{margin-top:24px}.coa-documents summary{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:50px;border:1px solid var(--coa-border);border-radius:16.8px;background:var(--coa-soft);padding:14px 16px;cursor:pointer;list-style:none;transition:background-color .2s}.coa-documents summary::-webkit-details-marker{display:none}.coa-documents summary:hover{background:#e4eee8}.coa-summary-label{display:flex;align-items:center;gap:8px;color:var(--coa-primary);font-size:14px;font-weight:600;line-height:20px}.coa-summary-label>svg{width:16px;height:16px;flex-shrink:0}.coa-chevron{width:16px;height:16px;flex-shrink:0;color:var(--coa-muted);transition:transform .2s}.coa-documents[open] .coa-chevron{transform:rotate(180deg)}
.coa-document-groups{display:flex;flex-direction:column;gap:24px;padding-top:16px}.coa-report-group{display:flex;flex-direction:column;gap:10px;min-width:0}.coa-report-group h3{font-size:14px;line-height:20px;font-weight:600}.coa-report-subtitle{margin-top:2px!important;font-size:12px;line-height:16px;color:var(--coa-muted)}.coa-report-pages{display:flex;flex-direction:column;gap:12px}.coa-report-pages img{display:block;max-width:100%;width:100%;height:auto;border-radius:12px;background:#fff}
.coa-pdf-pages,.coa-pdf-canvases{display:flex;flex-direction:column;gap:12px;min-width:0;width:100%}.coa-pdf-canvases canvas{border-radius:12px}.coa-pdf-status{padding:20px 0;font-size:13px;color:var(--coa-muted)}
.coa-verification-links{display:flex;flex-direction:column;gap:8px}.coa-verification-links a{display:flex;flex:1;min-width:0;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--coa-border);border-radius:16.8px;background:var(--coa-soft);padding:12px 16px;transition:background-color .2s,border-color .2s}.coa-verification-links a:hover{background:#e4eee8;border-color:#003f3566}.coa-verification-links a>span{display:flex;flex-direction:column;gap:2px}.coa-verification-links strong{font-size:14px;line-height:20px;font-weight:600;color:var(--coa-primary)}.coa-verification-links small{font-size:12px;line-height:16px;color:var(--coa-muted)}.coa-verification-links svg{width:16px;height:16px;flex-shrink:0;color:var(--coa-muted)}
.coa-batch{border-top:1px solid var(--coa-border);background:#f7faf8;padding:24px}.coa-batch dl{display:grid;grid-template-columns:minmax(0,1fr);column-gap:32px;row-gap:10px}.coa-batch dl>div{display:flex;align-items:baseline;justify-content:space-between;gap:16px;min-width:0;font-size:12px;line-height:20px}.coa-batch dt{color:var(--coa-muted);flex-shrink:0}.coa-batch dd{text-align:right;font-weight:500;overflow-wrap:anywhere}.coa-laboratory{grid-column:1/-1}
.coa-footer{display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:32px;text-align:center;color:white}.coa-wordmark{font-family:var(--coa-font-display),Arial,sans-serif;font-size:24px;line-height:32px;font-weight:700;letter-spacing:-.025em}.coa-wordmark>span{color:var(--coa-accent)}.coa-footer p{color:#ffffff99;font-size:12px;line-height:16px;font-weight:500;text-transform:uppercase;letter-spacing:.18em}
.regen-coa :is(a,summary):focus-visible{outline:2px solid var(--coa-accent);outline-offset:4px}
@media(min-width:640px){.coa-intro,.coa-content,.coa-batch{padding-left:40px;padding-right:40px}.coa-status-icon{width:144px;height:144px}.coa-check-drawing{width:72px;height:72px}.coa-intro h1{font-size:30px;line-height:36px}.coa-intro .coa-product-name{font-size:24px;line-height:32px}.coa-intro .coa-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.coa-verification-links{flex-direction:row}.coa-batch dl{grid-template-columns:repeat(2,minmax(0,1fr))}}
@keyframes coa-ring{0%{opacity:.25;transform:scale(.8)}100%{opacity:0;transform:scale(1.45)}}@keyframes coa-arrive{0%{transform:scale(.88);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes coa-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@media(prefers-reduced-motion:reduce){.regen-coa *{animation:none!important;transition:none!important}}
`

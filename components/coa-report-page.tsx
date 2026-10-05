import { FileText, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/logo'
import { PdfPages } from '@/app/coa/[code]/pdf-pages'
import type { CoaReport } from '@/lib/coa-reports'
import styles from './coa-report-page.module.css'

export function CoaReportPage({ report }: { report: CoaReport }) {
  const pageCount = report.documents.reduce((total, document) => total + document.pages, 0)

  return (
    <main lang="en" className={styles.page}>
      <div className={styles.container}>
        <header className={styles.brand}>
          <Logo variant="light" />
          <span>Laboratory documentation</span>
        </header>

        <article className={styles.card}>
          <header className={styles.intro}>
            <div className={styles.eyebrow}><FileText size={16} aria-hidden="true" /> Certificate of analysis</div>
            <h1>{report.name}</h1>
            <p>View the COA and laboratory documentation for {report.name}.</p>
            <div className={styles.meta}>
              <span>{report.documents.length} {report.documents.length === 1 ? 'document' : 'documents'}</span>
              <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
              <span>PDF</span>
            </div>
          </header>

          <div className={styles.documents}>
            {report.documents.map((document, index) => {
              const src = `/coa/${report.slug}/document/${document.id}`
              return (
                <section key={document.id} aria-labelledby={`document-${document.id}`} className={styles.document}>
                  <div className={styles.documentHeading}>
                    <div className={styles.documentTitle}>
                      <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h2 id={`document-${document.id}`}>{document.title}</h2>
                        <p>{report.name} · {document.pages} {document.pages === 1 ? 'page' : 'pages'}</p>
                      </div>
                    </div>
                    <a href={src} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer" aria-label={`Open ${report.name} ${document.title} PDF in a new tab`}>
                      Open PDF <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                  <div className={styles.viewer}>
                    <PdfPages src={src} title={`${report.name} — ${document.title}`} />
                  </div>
                </section>
              )
            })}
          </div>
        </article>

        <footer className={styles.footer}>Regen Longevity Lab <span aria-hidden="true">·</span> Laboratory documentation</footer>
      </div>
    </main>
  )
}

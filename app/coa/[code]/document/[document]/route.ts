import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getCoaDocument } from '@/lib/coa-reports'

export const runtime = 'nodejs'

const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, noimageindex',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; document: string }> },
) {
  const { code, document: id } = await params
  const document = getCoaDocument(code, id)
  if (!document) return new Response('Not found', { status: 404, headers })

  try {
    // Only a registered filename can reach the filesystem, never URL input.
    const bytes = await readFile(path.join(process.cwd(), 'lab-documents', 'coa', document.filename))
    if (bytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('Invalid PDF signature')
    }
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': `inline; filename="regen-${code}-${id}.pdf"`,
      },
    })
  } catch {
    return new Response('Unable to load document', { status: 500, headers })
  }
}

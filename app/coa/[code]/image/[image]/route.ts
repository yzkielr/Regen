import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noimageindex',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

async function readReportImage(image: string) {
  switch (image) {
    case '1':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/01-janoshik-purity.png',
      ))
    case '2':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/02-janoshik-chromatogram.pdf',
      ))
    case '3':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/03-janoshik-endotoxin.png',
      ))
    case '4':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/04-sample-photo.png',
      ))
    case '5':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/05-test-photo.png',
      ))
    case '6':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/06-uzorak-purity.pdf',
      ))
    case '7':
      return readFile(path.join(
        process.cwd(),
        'lab-documents/retatrutide/07-uzorak-endotoxin.pdf',
      ))
    default:
      throw new Error('Unknown report image')
  }
}

const pdfFilenames: Partial<Record<string, string>> = {
  '2': '02-janoshik-chromatogram.pdf',
  '6': '06-uzorak-purity.pdf',
  '7': '07-uzorak-endotoxin.pdf',
}

function imageType(bytes: Uint8Array): string | null {
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]

  if (
    bytes.length >= 8 &&
    pngSignature.every((value, index) => bytes[index] === value)
  ) {
    return 'image/png'
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  ) {
    return 'image/jpeg'
  }

  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(0, 4)).toString('ascii') === 'RIFF' &&
    Buffer.from(bytes.subarray(8, 12)).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }

  return null
}

function failure(reason: string, status = 404) {
  const development = process.env.NODE_ENV === 'development'

  if (development) {
    console.warn(`[Regen COA] ${reason}`)
  }

  return new Response(
    development
      ? reason
      : status === 404
        ? 'Not found'
        : 'Unable to load image',
    {
      status,
      headers: privateHeaders,
    },
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; image: string }> },
) {
  const { code, image } = await params
  const expectedCode = process.env.REGEN_RETATRUTIDE_COA_CODE

  if (!expectedCode) {
    return failure(
      'ENV_MISSING: REGEN_RETATRUTIDE_COA_CODE belum tersedia.',
    )
  }

  if (!/^[A-Za-z0-9_-]{32,128}$/.test(expectedCode)) {
    return failure(
      'ENV_INVALID: kode akses harus 32-128 karakter; bukan reta10.',
    )
  }

  if (code !== expectedCode) {
    return failure(
      'CODE_MISMATCH: kode pada URL file berbeda dari kode akses server.',
    )
  }

  if (!/^[1-7]$/.test(image)) {
    return failure(
      'SLOT_INVALID: nomor dokumen harus 1 sampai 7.',
    )
  }

  try {
    const bytes = new Uint8Array(await readReportImage(image))
    const pdfFilename = pdfFilenames[image]

    const contentType = pdfFilename
      ? (
          Buffer.from(bytes.subarray(0, 5)).toString('ascii') === '%PDF-'
            ? 'application/pdf'
            : null
        )
      : imageType(bytes)

    if (!contentType) {
      return failure(
        `FILE_TYPE_INVALID: isi dokumen nomor ${image} tidak sesuai format yang diharapkan.`,
      )
    }

    return new Response(bytes, {
      headers: {
        ...privateHeaders,
        'Content-Type': contentType,
        'Content-Length': String(bytes.byteLength),
        ...(pdfFilename
          ? {
              'Content-Disposition':
                `inline; filename="${pdfFilename}"`,
            }
          : {}),
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return failure(
        `FILE_NOT_FOUND: dokumen nomor ${image} tidak ditemukan. Cocokkan nama file di readReportImage dengan folder lab-documents/retatrutide.`,
      )
    }

    return failure(
      `FILE_READ_ERROR: dokumen nomor ${image} gagal dibaca.`,
      500,
    )
  }
}
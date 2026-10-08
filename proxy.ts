import { NextResponse, type NextRequest } from 'next/server'
import { REGION_COOKIE, REGION_HEADER, getRegionFromPath } from '@/lib/regions'

export function proxy(request: NextRequest) {
  const region = getRegionFromPath(request.nextUrl.pathname)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-regen-admin-route', request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/') ? '1' : '0')
  // Use the validated URL, never a caller-supplied header, for SSR language.
  requestHeaders.set(REGION_HEADER, region?.id ?? '')
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  // Background prefetches must not change the visitor's selected market.
  if (
    region && request.method === 'GET' &&
    request.headers.get('rsc') !== '1' &&
    !request.headers.has('next-router-prefetch') &&
    request.headers.get('purpose') !== 'prefetch' &&
    !request.headers.get('sec-purpose')?.includes('prefetch') &&
    request.cookies.get(REGION_COOKIE)?.value !== region.id
  ) {
    response.cookies.set(REGION_COOKIE, region.id, {
      path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    })
  }
  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}

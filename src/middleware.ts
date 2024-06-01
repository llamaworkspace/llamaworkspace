import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { env } from './env.mjs'

export const config = {
  matcher: ['/api/llamaq/:path*'],
}

const SECRET_KEY = env.LLAMAQ_INCOMING_API_ROUTE_ACCESS_KEY

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return getUnauthorizedResponse()
  }

  const token = authHeader.split(' ')[1]
  if (!token) return getUnauthorizedResponse()

  if (token !== SECRET_KEY) return getUnauthorizedResponse()
  return NextResponse.next()
}

const getUnauthorizedResponse = () => {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}

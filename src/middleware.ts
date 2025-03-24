import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Paths that require authentication will be handled by client-side checks
  // in FirebaseContext and Layout components
  
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: []
} 
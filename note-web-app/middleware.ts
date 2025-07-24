import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 보호된 경로들
  const protectedPaths = ["/dashboard", "/notes"]
  const authPaths = ["/auth/login", "/auth/register"]

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // 토큰 확인 (쿠키, 헤더에서 확인)
  const cookieToken = request.cookies.get("accessToken")?.value
  const headerToken = request.headers.get("authorization")?.replace("Bearer ", "")

  const token = cookieToken || headerToken
  const hasValidToken = token && token.length > 0

  // 보호된 경로에 토큰 없이 접근하는 경우
  if (isProtectedPath && !hasValidToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // 이미 로그인한 상태에서 인증 페이지에 접근하는 경우
  if (isAuthPath && hasValidToken && !pathname.includes("complete-profile")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/auth/:path*"],
}

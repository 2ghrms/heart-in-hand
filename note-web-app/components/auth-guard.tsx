"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 인증 상태 확인
  useEffect(() => {
    if (!isClient) return

    const checkAuth = () => {
      const isValid = authUtils.isTokenValid()
      setIsAuthenticated(isValid)

      if (requireAuth && !isValid) {
        console.log("[AuthGuard] 토큰이 없음 - 로그인 페이지로 이동")
        router.push("/auth/login?message=로그인이 필요합니다")
      }
    }

    checkAuth()
  }, [isClient, requireAuth, router])

  // 전역 에러 핸들러 설정
  useEffect(() => {
    if (!isClient) return

    const handleUnauthorized = (event: CustomEvent) => {
      console.log("[AuthGuard] 인증 에러 감지")
      authUtils.logout("세션이 만료되었습니다. 다시 로그인해주세요.")
    }

    window.addEventListener("unauthorized" as any, handleUnauthorized)

    return () => {
      window.removeEventListener("unauthorized" as any, handleUnauthorized)
    }
  }, [isClient])

  // 서버 사이드 렌더링 중이거나 인증이 필요한데 인증되지 않은 경우
  if (!isClient) {
    return null // 또는 로딩 스피너
  }

  if (requireAuth && !isAuthenticated) {
    return null // 또는 로딩 스피너
  }

  return <>{children}</>
}

// 인증 관련 유틸리티 함수들
export const authUtils = {
  // 클라이언트 사이드 체크 함수
  isClient: () => typeof window !== "undefined",

  // 토큰 저장 (localStorage + 쿠키 둘 다)
  saveTokens: (accessToken: string, refreshToken: string, memberId: string) => {
    console.log("[인증] 토큰 저장 중...")

    // 🔥 클라이언트 사이드에서만 실행
    if (!authUtils.isClient()) {
      console.log("[인증] 서버 사이드에서는 토큰 저장 스킵")
      return
    }

    try {
      // localStorage에 저장
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("memberId", memberId)

      // 쿠키에도 저장 (middleware에서 사용)
      const expires = new Date()
      expires.setDate(expires.getDate() + 7) // 7일 후 만료

      document.cookie = `accessToken=${accessToken}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
      document.cookie = `refreshToken=${refreshToken}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
      document.cookie = `memberId=${memberId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

      console.log("[인증] 토큰 저장 완료 (localStorage + 쿠키)")
    } catch (error) {
      console.error("[인증] 토큰 저장 실패:", error)
    }
  },

  // 로그아웃 처리
  logout: (message?: string) => {
    console.log("[인증] 로그아웃 처리:", message)

    // 🔥 클라이언트 사이드에서만 실행
    if (!authUtils.isClient()) {
      console.log("[인증] 서버 사이드에서는 로그아웃 스킵")
      return
    }

    try {
      // localStorage에서 제거
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("memberId")

      // 쿠키에서도 제거
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "memberId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // 메시지와 함께 로그인 페이지로 리디렉션
      const loginUrl = message ? `/auth/login?message=${encodeURIComponent(message)}` : "/auth/login"
      window.location.href = loginUrl
    } catch (error) {
      console.error("[인증] 로그아웃 실패:", error)
    }
  },

  // 토큰 유효성 검사
  isTokenValid: (): boolean => {
    if (!authUtils.isClient()) {
      return false
    }

    try {
      const token = localStorage.getItem("accessToken")
      return !!token && token.length > 0
    } catch (error) {
      console.error("[인증] 토큰 확인 실패:", error)
      return false
    }
  },

  // 인증 헤더 생성
  getAuthHeaders: () => {
    if (!authUtils.isClient()) {
      return {
        "Content-Type": "application/json",
      }
    }

    try {
      const token = localStorage.getItem("accessToken")
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    } catch (error) {
      console.error("[인증] 헤더 생성 실패:", error)
      return {
        "Content-Type": "application/json",
      }
    }
  },
}

// API 에러 처리 함수
export const handleApiError = (error: any, context?: string) => {
  console.error(`[API 에러${context ? ` - ${context}` : ""}]:`, error)

  if (error.status === 401 || error.status === 403) {
    authUtils.logout("세션이 만료되었습니다. 다시 로그인해주세요.")
    return
  }

  // 다른 에러들은 그대로 throw
  throw error
}

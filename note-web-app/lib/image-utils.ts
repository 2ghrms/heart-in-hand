import type React from "react"
// 이미지 URL 처리 유틸리티

export const imageUtils = {
  // 🔥 Spring에서 온 이미지 URL을 Next.js에서 사용할 수 있도록 변환
  normalizeImageUrl: (imageUrl: string | null | undefined): string => {
    if (!imageUrl) {
      return "/placeholder.svg?height=200&width=200"
    }

    // 이미 완전한 URL인 경우 (http:// 또는 https://)
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // Spring static 경로인 경우 (/noteImages/...)
    if (imageUrl.startsWith("/noteImages/")) {
      // Next.js 프록시를 통해 접근
      return imageUrl
    }

    // 상대 경로인 경우 (noteImages/...)
    if (imageUrl.startsWith("noteImages/")) {
      return `/${imageUrl}`
    }

    // 기타 경우 그대로 반환
    return imageUrl
  },

  // 🔥 이미지 로드 에러 처리
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget
    console.warn("[이미지] 로드 실패:", img.src)

    // 플레이스홀더로 대체
    img.src = "/placeholder.svg?height=200&width=200"
  },

  // 🔥 이미지 로드 성공 로그
  handleImageLoad: (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget
    console.log("[이미지] 로드 성공:", img.src)
  },

  // 🔥 개발 환경에서 이미지 URL 디버깅
  debugImageUrl: (originalUrl: string, normalizedUrl: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[이미지 디버그]", {
        original: originalUrl,
        normalized: normalizedUrl,
        timestamp: new Date().toISOString(),
      })
    }
  },

  // 🔥 이미지 URL이 유효한지 확인
  isValidImageUrl: (url: string): boolean => {
    if (!url) return false
    
    // 기본적인 URL 형식 검증
    try {
      new URL(url, window.location.origin)
      return true
    } catch {
      // 상대 경로인 경우
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
    }
  },

  // 🔥 이미지 로드 재시도
  retryImageLoad: (img: HTMLImageElement, maxRetries: number = 3) => {
    let retryCount = 0
    
    const retry = () => {
      if (retryCount < maxRetries) {
        retryCount++
        console.log(`[이미지] 재시도 ${retryCount}/${maxRetries}:`, img.src)
        
        // 캐시 방지를 위한 타임스탬프 추가
        const separator = img.src.includes('?') ? '&' : '?'
        img.src = `${img.src}${separator}t=${Date.now()}`
      } else {
        console.warn("[이미지] 최대 재시도 횟수 초과:", img.src)
        img.src = "/placeholder.svg?height=200&width=200"
      }
    }
    
    img.onerror = retry
  }
}

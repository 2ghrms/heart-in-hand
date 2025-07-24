// 날짜 처리 유틸리티 함수들
export const dateUtils = {
  // 🔥 안전한 날짜 파싱
  parseDate: (dateString: string | null | undefined): Date => {
    if (!dateString) {
      console.warn("[날짜유틸] 빈 날짜 문자열, 현재 시간 반환")
      return new Date()
    }

    try {
      const parsed = new Date(dateString)

      // Invalid Date 체크
      if (isNaN(parsed.getTime())) {
        console.warn("[날짜유틸] 유효하지 않은 날짜:", dateString)
        return new Date()
      }

      return parsed
    } catch (error) {
      console.error("[날짜유틸] 날짜 파싱 에러:", error, dateString)
      return new Date()
    }
  },

  // 🔥 안전한 날짜 포맷팅
  formatDate: (
    dateString: string | null | undefined,
    options?: {
      includeTime?: boolean
      locale?: string
    },
  ): string => {
    const { includeTime = false, locale = "ko-KR" } = options || {}

    try {
      const date = dateUtils.parseDate(dateString)

      if (includeTime) {
        return date.toLocaleString(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      } else {
        return date.toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
    } catch (error) {
      console.error("[날짜유틸] 포맷팅 에러:", error, dateString)
      return "날짜 오류"
    }
  },

  // 🔥 상대적 시간 표시 (예: "3일 전", "방금 전")
  formatRelativeTime: (dateString: string | null | undefined): string => {
    try {
      const date = dateUtils.parseDate(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 1) return "방금 전"
      if (diffMinutes < 60) return `${diffMinutes}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 7) return `${diffDays}일 전`

      // 일주일 이상이면 정확한 날짜 표시
      return dateUtils.formatDate(dateString)
    } catch (error) {
      console.error("[날짜유틸] 상대시간 에러:", error, dateString)
      return "날짜 오류"
    }
  },

  // 🔥 ISO 문자열 검증
  isValidISOString: (dateString: string): boolean => {
    try {
      const date = new Date(dateString)
      return !isNaN(date.getTime()) && dateString.includes("T")
    } catch {
      return false
    }
  },
}

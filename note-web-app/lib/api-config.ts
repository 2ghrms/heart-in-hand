// API 설정 및 상태 확인
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

export const API_CONFIG = {
  BASE_URL: API_BASE_URL || "/api/proxy", // 프록시 경로 사용
  TIMEOUT: 10000, // 10초 타임아웃
}

export async function checkApiHealth(): Promise<{ isHealthy: boolean; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5초 타임아웃

    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    return {
      isHealthy: response.ok,
      error: response.ok ? undefined : `서버 응답 오류: ${response.status}`,
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        isHealthy: false,
        error: "서버 응답 시간 초과 (5초)",
      }
    }

    return {
      isHealthy: false,
      error: `서버 연결 실패: ${error.message}`,
    }
  }
}

export function createApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// 개발 환경에서 사용할 목업 데이터
export const MOCK_DATA = {
  login: {
    isSuccess: true,
    code: "SUCCESS",
    message: "로그인 성공",
    result: {
      memberId: 1,
      accessToken: "mock-access-token-12345",
      refreshToken: "mock-refresh-token-12345",
      accessTokenExpiresIn: 3600,
    },
  },
  userInfo: {
    isSuccess: true,
    code: "SUCCESS",
    message: "조회 성공",
    result: {
      id: 1,
      email: "demo@noteai.com",
      name: null, // 처음 가입한 사용자 시뮬레이션
      createdAt: "2024-01-01T00:00:00Z",
    },
  },
}

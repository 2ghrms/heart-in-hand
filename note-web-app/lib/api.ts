const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  private async handleResponse(response: Response) {
    // 401 또는 403 에러 시 로그아웃 처리
    if (response.status === 401 || response.status === 403) {
      console.log(`[API] ${response.status} 에러 발생 - 자동 로그아웃 처리`)

      // 토큰 만료인 경우 리프레시 시도 (401만)
      if (response.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              localStorage.setItem("accessToken", data.accessToken)
              return { success: true, needsRetry: true }
            }
          } catch (error) {
            console.error("토큰 리프레시 실패:", error)
          }
        }
      }

      // 리프레시 실패하거나 403인 경우 로그아웃 처리
      this.handleLogout("세션이 만료되었습니다. 다시 로그인해주세요.")
      return { success: false, needsRetry: false }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "API 요청에 실패했습니다")
    }

    return { success: true, needsRetry: false, data: await response.json() }
  }

  // 로그아웃 처리 메서드 추가
  private handleLogout(message?: string) {
    // 토큰 제거
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("memberId")

    // 쿠키도 제거
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // 메시지와 함께 로그인 페이지로 리디렉션
    const loginUrl = message ? `/auth/login?message=${encodeURIComponent(message)}` : "/auth/login"

    window.location.href = loginUrl
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    const result = await this.handleResponse(response)

    if (result.needsRetry) {
      // Retry with new token
      const newHeaders = {
        ...this.getAuthHeaders(),
        ...options.headers,
      }
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      })
      const retryResult = await this.handleResponse(response)
      return retryResult.data
    }

    return result.data
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Login failed")
    }

    const data = await response.json()

    if (!data.isSuccess) {
      throw new Error(data.message || "Login failed")
    }

    return data
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Registration failed")
    }

    return response.json()
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  // User methods
  async getUserInfo() {
    return this.request("/members/my-info")
  }

  async updateUser(id: string, userData: { name?: string; password?: string }) {
    return this.request(`/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  }

  // Notes methods - API 명세에 맞게 수정
  async getNotes() {
    return this.request("/notes/my-notes")
  }

  async getNote(noteId: string) {
    // noteId 검증 추가
    if (!noteId || noteId === "undefined" || noteId === "null") {
      throw new Error("유효하지 않은 노트 ID입니다")
    }
    return this.request(`/notes/${noteId}`)
  }

  async createNote(formData: FormData) {
    const token = localStorage.getItem("accessToken")
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const result = await this.handleResponse(response)

    // noteId 추출 로직 추가
    if (result.data) {
      const noteData = result.data
      let extractedNoteId = null

      if (noteData.noteId) {
        extractedNoteId = noteData.noteId
      } else if (noteData.result && noteData.result.noteId) {
        extractedNoteId = noteData.result.noteId
      } else if (noteData.id) {
        extractedNoteId = noteData.id
      } else if (noteData.result && noteData.result.id) {
        extractedNoteId = noteData.result.id
      }

      console.log("[API] 노트 생성 응답에서 추출된 noteId:", extractedNoteId)

      // noteId가 없으면 에러
      if (!extractedNoteId) {
        console.error("[API] noteId를 찾을 수 없음:", noteData)
        throw new Error("노트 생성은 성공했지만 ID를 가져올 수 없습니다.")
      }

      // 정규화된 응답 반환
      return {
        ...noteData,
        noteId: extractedNoteId,
      }
    }

    return result.data
  }

  async deleteNote(noteId: string) {
    // noteId 검증 추가
    if (!noteId || noteId === "undefined" || noteId === "null") {
      throw new Error("유효하지 않은 노트 ID입니다")
    }
    return this.request(`/notes/${noteId}`, { method: "DELETE" })
  }

  async checkUserProfile() {
    try {
      const userInfo = await this.request("/members/my-info")
      return userInfo
    } catch (error) {
      console.error("Failed to fetch user info:", error)
      return null
    }
  }
}

export const apiClient = new ApiClient()

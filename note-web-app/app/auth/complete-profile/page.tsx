"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, User, CheckCircle, Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

export default function CompleteProfilePage() {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("이름을 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    console.log("[프로필완성] 시작")

    try {
      const token = localStorage.getItem("accessToken")
      const memberId = localStorage.getItem("memberId")

      console.log("[프로필완성] 토큰 존재:", !!token)
      console.log("[프로필완성] 멤버ID:", memberId)

      if (!token || !memberId) {
        console.log("[프로필완성] 토큰 없음 - 로그인 페이지로 이동")
        router.push("/auth/login")
        return
      }

      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      })

      console.log("[프로필완성] 응답 상태:", response.status)

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
        console.log("[프로필완성] 응답 데이터:", data)
      } catch (parseError) {
        throw new Error("서버 응답을 파싱할 수 없습니다")
      }

      if (response.ok) {
        if (data.isSuccess) {
          console.log("[프로필완성] 성공! 쿠키 업데이트 후 대시보드로 이동")

          // 🔥 중요: 프로필 완성 후 쿠키 다시 설정 (middleware 인식용)
          const currentToken = localStorage.getItem("accessToken")
          const currentRefreshToken = localStorage.getItem("refreshToken")
          const currentMemberId = localStorage.getItem("memberId")

          if (currentToken && currentRefreshToken && currentMemberId) {
            authUtils.saveTokens(currentToken, currentRefreshToken, currentMemberId)
          }

          // 잠시 대기 후 이동
          setTimeout(() => {
            console.log("[프로필완성] 대시보드로 이동 실행")
            window.location.href = "/dashboard" // router.push 대신 window.location 사용
          }, 500)
        } else {
          setError(data.message || "프로필 업데이트에 실패했습니다.")
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          console.log("[프로필완성] 인증 에러 - 로그인 페이지로 이동")
          authUtils.logout("세션이 만료되었습니다. 다시 로그인해주세요.")
          return
        }

        setError(data.message || `서버 오류: ${response.status}`)
      }
    } catch (error: any) {
      console.error("[프로필완성] 오류:", error)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
      } else {
        setError(error.message || "네트워크 오류가 발생했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-2xl font-bold text-gray-900">손마음</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">거의 다 왔어요!</h1>
          <p className="text-gray-600">마지막으로 어떻게 불러드릴까요?</p>
        </div>

        <Card className="border-0 shadow-xl border-rose-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center text-rose-900">
              <User className="h-6 w-6 mr-2 text-rose-500" />
              이름 입력
            </CardTitle>
            <CardDescription className="text-center">손마음에서 사용할 이름을 알려주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 text-lg border-rose-200 focus:border-rose-400"
                  autoFocus
                />
                <p className="text-xs text-gray-500">실명 또는 손마음에서 사용할 별명을 입력해주세요</p>
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    완성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    손마음 시작하기
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card className="mt-6 border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="font-semibold text-rose-900">손마음에 오신 것을 환영해요!</h3>
              <p className="text-sm text-rose-700">
                이제 소중한 손글씨들을 마음과 함께 간직할 수 있는 특별한 공간이 준비되었어요.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-rose-600">
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  감성 보관
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  추억 간직
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  마음 전달
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Eye, EyeOff, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authUtils } from "@/lib/auth-utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get("message")
    if (message) {
      setSuccess(message)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("[로그인] 시도:", email)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      console.log("[로그인] 응답 상태:", res.status)

      const responseText = await res.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("서버 응답을 파싱할 수 없습니다")
      }

      if (!res.ok) {
        throw new Error(data.message || `서버 오류: ${res.status}`)
      }

      if (data.isSuccess && data.result && data.result.accessToken) {
        console.log("[로그인] 성공! 토큰 저장 중...")

        // 🔥 중요: authUtils 사용해서 토큰 저장 (localStorage + 쿠키)
        authUtils.saveTokens(data.result.accessToken, data.result.refreshToken, data.result.memberId.toString())

        console.log("[로그인] 사용자 정보 조회 중...")

        // 사용자 정보 확인
        try {
          const userInfoResponse = await fetch(`${API_BASE_URL}/members/my-info`, {
            headers: {
              Authorization: `Bearer ${data.result.accessToken}`,
              "Content-Type": "application/json",
            },
          })

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json()
            console.log("[로그인] 사용자 정보:", userInfo)

            if (userInfo.isSuccess && userInfo.result) {
              if (!userInfo.result.name) {
                console.log("[로그인] 프로필 완성 페이지로 이동")
                router.push("/auth/complete-profile")
              } else {
                console.log("[로그인] 대시보드로 이동")
                router.push("/dashboard")
              }
            } else {
              router.push("/dashboard")
            }
          } else {
            router.push("/dashboard")
          }
        } catch (userInfoError) {
          console.error("[로그인] 사용자 정보 조회 실패:", userInfoError)
          router.push("/dashboard")
        }
      } else {
        throw new Error("로그인 응답에 토큰이 없습니다")
      }
    } catch (err: any) {
      console.error("[로그인] 오류:", err)

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
      } else {
        setError(err.message || "로그인에 실패했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-2xl font-bold text-gray-900">손마음</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">다시 만나서 반가워요</h1>
          <p className="text-gray-600">소중한 손글씨 아카이브로 돌아오신 것을 환영합니다</p>
        </div>

        <Card className="border-0 shadow-xl border-rose-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-rose-900">로그인</CardTitle>
            <CardDescription className="text-center">이메일과 비밀번호를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-rose-200 focus:border-rose-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10 border-rose-200 focus:border-rose-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "손마음으로 들어가기"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                아직 손마음이 처음이신가요?{" "}
                <Link href="/auth/register" className="text-rose-600 hover:text-rose-700 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

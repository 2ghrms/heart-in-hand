"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/proxy"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const router = useRouter()

  // 브라우저 탭 타이틀 설정
  useEffect(() => {
    document.title = "회원가입 - 손마음"
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.")
      return false
    }
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return false
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("이용약관과 개인정보처리방침에 동의해주세요.")
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // 1. 회원가입 API 호출
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      })

      const registerData = await registerResponse.json()

      if (registerResponse.ok && registerData.isSuccess) {
        // 2. 회원가입 성공 시 바로 로그인 처리
        try {
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
            credentials: "include",
          })

          const loginData = await loginResponse.json()

          if (loginResponse.ok && loginData.isSuccess && loginData.result) {
            console.log("[회원가입] 자동 로그인 성공, 토큰 저장 중...")

            // 🔥 중요: authUtils 사용해서 토큰 저장 (localStorage + 쿠키)
            authUtils.saveTokens(
              loginData.result.accessToken,
              loginData.result.refreshToken,
              loginData.result.memberId.toString(),
            )

            // 프로필 완성 페이지로 이동
            router.push("/auth/complete-profile")
          } else {
            // 로그인 실패 시 로그인 페이지로 이동
            router.push("/auth/login?message=회원가입이 완료되었습니다. 로그인해주세요.")
          }
        } catch (loginError) {
          // 로그인 실패 시 로그인 페이지로 이동
          router.push("/auth/login?message=회원가입이 완료되었습니다. 로그인해주세요.")
        }
      } else {
        setError(registerData.message || "회원가입에 실패했습니다.")
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-2xl font-bold text-gray-900">손마음</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">손마음과 함께해요</h1>
          <p className="text-gray-600">소중한 손글씨를 간직할 특별한 공간을 만들어보세요</p>
        </div>

        <Card className="border-0 shadow-xl border-rose-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-rose-900">회원가입</CardTitle>
            <CardDescription className="text-center">
              이메일과 비밀번호만 입력하면 바로 시작할 수 있어요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12 border-rose-200 focus:border-rose-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="최소 6자 이상"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-10 border-rose-200 focus:border-rose-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-10 border-rose-200 focus:border-rose-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Agreement Checkboxes */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms} />
                  <Label htmlFor="terms" className="text-sm">
                    <Link href="/terms" className="text-rose-600 hover:text-rose-700">
                      이용약관
                    </Link>
                    에 동의합니다 (필수)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={setAgreePrivacy} />
                  <Label htmlFor="privacy" className="text-sm">
                    <Link href="/privacy" className="text-rose-600 hover:text-rose-700">
                      개인정보처리방침
                    </Link>
                    에 동의합니다 (필수)
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
                {isLoading ? "가입 중..." : "손마음 시작하기"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                이미 손마음 회원이신가요?{" "}
                <Link href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mt-4 border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-rose-500" />
                <span className="text-sm text-rose-800">무료로 시작</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-800">감성 손글씨 보관</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-800">추억 안전 보관</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

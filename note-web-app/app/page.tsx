"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Sparkles, ArrowRight, CheckCircle, Star, PenTool } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 브라우저 탭 타이틀 설정
  useEffect(() => {
    document.title = "손마음 - 소중한 손글씨를 마음과 함께"
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-2xl font-bold text-gray-900">손마음</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-rose-500 hover:bg-rose-600">시작하기</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-banner.png')",
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-orange-400/8 to-pink-500/6"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Badge variant="secondary" className="mb-4 bg-rose-100 text-rose-700 border-rose-200">
                <Sparkles className="h-4 w-4 mr-1" />
                소중한 손글씨 아카이브
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                마음을 담은 손글씨를
                <br />
                <span className="text-rose-500">영원히 간직하세요</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl leading-relaxed">
                연인의 메모, 부모님의 편지, 친구의 쪽지... 소중한 사람들의 손글씨를 디지털로 보관하고 추억을 간직하는
                특별한 공간입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="text-lg px-8 py-6 bg-rose-500 hover:bg-rose-600 shadow-lg">
                    첫 손글씨 간직하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-rose-200 text-rose-700 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    이미 손마음 회원이에요
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">왜 손마음을 선택해야 할까요?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              소중한 손글씨를 예술처럼 보관하고, 감정과 추억을 디지털로 영원히 간직할 수 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 border-rose-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
                <CardTitle className="text-2xl text-rose-900">감성 보관함</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg text-gray-600">
                  손글씨에 담긴 마음과 감정을 그대로 보존하여 언제든 다시 느낄 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 border-orange-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-2xl text-orange-900">손글씨 예술관</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg text-gray-600">
                  각자의 개성이 담긴 손글씨를 예술작품처럼 아름답게 전시하고 감상할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 border-purple-100">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-2xl text-purple-900">추억 공유</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg text-gray-600">
                  소중한 사람들과 함께 손글씨 추억을 나누고, 마음을 전할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">어떻게 시작하나요?</h2>
            <p className="text-xl text-gray-600">간단한 3단계로 소중한 손글씨를 영원히 간직하세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-rose-900">손글씨 촬영</h3>
              <p className="text-gray-600 text-lg">소중한 손글씨를 사진으로 촬영하거나 스캔해서 업로드하세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-orange-900">추억 기록</h3>
              <p className="text-gray-600 text-lg">언제, 누가, 어떤 마음으로 쓴 글씨인지 따뜻한 이야기를 남겨보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-900">영원히 간직</h3>
              <p className="text-gray-600 text-lg">디지털 아카이브에 안전하게 보관하고 언제든 추억을 되새겨보세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">마음이 담긴 손글씨의 특별함</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">감정의 온도</h3>
                    <p className="text-gray-600">디지털로는 전할 수 없는 손글씨만의 따뜻함과 감정을 그대로 보존</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">개성의 아름다움</h3>
                    <p className="text-gray-600">각자만의 독특한 글씨체와 개성을 예술작품처럼 감상</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">추억의 보물상자</h3>
                    <p className="text-gray-600">시간이 지나도 변하지 않는 소중한 추억을 안전하게 보관</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="h-16 w-16 text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-rose-900">손마음 아카이브</h3>
                <p className="text-gray-600 mb-6">
                  {"소중한 사람들의 마음이 담긴 손글씨를 영원히 간직할 수 있는 특별한 공간입니다"}
                </p>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 to-orange-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">소중한 손글씨를 지금 간직해보세요</h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            연인의 편지, 가족의 메모, 친구의 쪽지... 마음이 담긴 모든 손글씨를 따뜻하게 보관해드립니다.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-rose-600 hover:bg-rose-50">
              첫 손글씨 아카이브 만들기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-rose-400" />
                <span className="text-2xl font-bold">손마음</span>
              </div>
              <p className="text-gray-400">소중한 손글씨를 마음과 함께 영원히 간직하는 특별한 공간입니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    손글씨 보관
                  </Link>
                </li>
                <li>
                  <Link href="/archive" className="hover:text-white">
                    추억 아카이브
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    도움말
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    자주 묻는 질문
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">회사</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    손마음 이야기
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 손마음. 모든 마음을 소중히 간직합니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

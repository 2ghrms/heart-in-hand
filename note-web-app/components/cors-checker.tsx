"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Network } from "lucide-react"

export function CorsChecker() {
  const [results, setResults] = useState<any[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkCors = async () => {
    setIsChecking(true)
    const tests = [
      {
        name: "기본 연결 테스트",
        url: "http://localhost:8080",
        method: "GET",
      },
      {
        name: "API Health Check",
        url: "http://localhost:8080/api/v1/health",
        method: "GET",
      },
      {
        name: "로그인 API (CORS 테스트)",
        url: "http://localhost:8080/api/v1/auth/login",
        method: "POST",
        body: { email: "test@test.com", password: "test123" },
      },
      {
        name: "OPTIONS 요청 (Preflight)",
        url: "http://localhost:8080/api/v1/auth/login",
        method: "OPTIONS",
      },
    ]

    const testResults = []

    for (const test of tests) {
      try {
        const startTime = Date.now()
        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: test.body ? JSON.stringify(test.body) : undefined,
        })
        const endTime = Date.now()

        testResults.push({
          ...test,
          success: true,
          status: response.status,
          statusText: response.statusText,
          responseTime: endTime - startTime,
          headers: Object.fromEntries(response.headers.entries()),
          corsHeaders: {
            "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
            "access-control-allow-methods": response.headers.get("access-control-allow-methods"),
            "access-control-allow-headers": response.headers.get("access-control-allow-headers"),
          },
        })
      } catch (error: any) {
        testResults.push({
          ...test,
          success: false,
          error: error.message,
          isCorsError: error.message.includes("CORS") || error.message.includes("fetch"),
        })
      }
    }

    setResults(testResults)
    setIsChecking(false)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Network className="h-5 w-5 mr-2" />
          CORS 문제 진단
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkCors} disabled={isChecking} className="w-full">
          {isChecking ? "검사 중..." : "CORS 문제 확인하기"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">진단 결과:</h4>
            {results.map((result, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{result.name}</h5>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {result.success ? "성공" : "실패"}
                      </Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <p>
                        <strong>URL:</strong> {result.url}
                      </p>
                      <p>
                        <strong>Method:</strong> {result.method}
                      </p>

                      {result.success ? (
                        <>
                          <p>
                            <strong>상태:</strong> {result.status} {result.statusText}
                          </p>
                          <p>
                            <strong>응답시간:</strong> {result.responseTime}ms
                          </p>

                          {/* CORS 헤더 확인 */}
                          <div className="mt-2">
                            <p className="font-medium">CORS 헤더:</p>
                            <div className="bg-gray-50 p-2 rounded text-xs">
                              <p>
                                Access-Control-Allow-Origin:{" "}
                                {result.corsHeaders["access-control-allow-origin"] || "❌ 없음"}
                              </p>
                              <p>
                                Access-Control-Allow-Methods:{" "}
                                {result.corsHeaders["access-control-allow-methods"] || "❌ 없음"}
                              </p>
                              <p>
                                Access-Control-Allow-Headers:{" "}
                                {result.corsHeaders["access-control-allow-headers"] || "❌ 없음"}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-red-600">
                          <p>
                            <strong>오류:</strong> {result.error}
                          </p>
                          {result.isCorsError && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                CORS 오류로 보입니다! 서버에서 CORS 설정이 필요합니다.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 해결 방법 제안 */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">CORS 문제 해결 방법:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>백엔드 서버에서 CORS 설정 추가</li>
                    <li>Next.js proxy 사용 (아래 코드 참고)</li>
                    <li>개발 환경에서 브라우저 CORS 비활성화</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

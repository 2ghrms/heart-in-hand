"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Bug, Network, AlertTriangle } from "lucide-react"

export function NetworkDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any[]>([])

  const testApiConnection = async () => {
    const tests = [
      {
        name: "기본 연결 테스트",
        url: "http://localhost:8080",
        method: "GET",
      },
      {
        name: "API 헬스 체크",
        url: "http://localhost:8080/api/v1/health",
        method: "GET",
      },
      {
        name: "로그인 엔드포인트 테스트",
        url: "http://localhost:8080/api/v1/auth/login",
        method: "POST",
        body: { email: "test@test.com", password: "test123" },
      },
    ]

    const results = []

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

        results.push({
          ...test,
          status: response.status,
          statusText: response.statusText,
          responseTime: endTime - startTime,
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        })
      } catch (error) {
        results.push({
          ...test,
          error: error.message,
          success: false,
        })
      }
    }

    setDebugInfo(results)
  }

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Bug className="h-5 w-5 mr-2" />
                네트워크 디버거
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testApiConnection} className="w-full">
                <Network className="h-4 w-4 mr-2" />
                API 연결 테스트 실행
              </Button>

              {debugInfo.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">테스트 결과:</h4>
                  {debugInfo.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{result.name}</h5>
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.success ? "성공" : "실패"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            <strong>URL:</strong> {result.url}
                          </p>
                          {result.status && (
                            <p className="text-sm text-gray-600">
                              <strong>상태:</strong> {result.status} {result.statusText}
                            </p>
                          )}
                          {result.responseTime && (
                            <p className="text-sm text-gray-600">
                              <strong>응답 시간:</strong> {result.responseTime}ms
                            </p>
                          )}
                          {result.error && (
                            <div className="flex items-start space-x-2 text-red-600">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">
                                <strong>오류:</strong> {result.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>일반적인 해결 방법:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>서버가 localhost:8080에서 실행 중인지 확인</li>
                  <li>서버에서 CORS 설정 확인</li>
                  <li>방화벽 또는 보안 소프트웨어 확인</li>
                  <li>브라우저 개발자 도구의 Network 탭 확인</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

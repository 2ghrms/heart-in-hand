"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw, Server } from "lucide-react"
import { checkApiHealth } from "@/lib/api-config"

interface ApiStatusCheckerProps {
  onStatusChange?: (isHealthy: boolean) => void
}

export function ApiStatusChecker({ onStatusChange }: ApiStatusCheckerProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [apiStatus, setApiStatus] = useState<{
    isHealthy: boolean
    error?: string
    lastChecked?: Date
  }>({
    isHealthy: false,
  })

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const result = await checkApiHealth()
      const newStatus = {
        ...result,
        lastChecked: new Date(),
      }
      setApiStatus(newStatus)
      onStatusChange?.(result.isHealthy)
    } catch (error) {
      setApiStatus({
        isHealthy: false,
        error: `상태 확인 실패: ${error.message}`,
        lastChecked: new Date(),
      })
      onStatusChange?.(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Server className="h-5 w-5 mr-2" />
          API 서버 상태
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {apiStatus.isHealthy ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${apiStatus.isHealthy ? "text-green-800" : "text-red-800"}`}>
                {apiStatus.isHealthy ? "연결됨" : "연결 실패"}
              </span>
            </div>
            <Button onClick={checkStatus} disabled={isChecking} size="sm" variant="outline">
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isChecking ? "확인 중..." : "다시 확인"}
            </Button>
          </div>

          {apiStatus.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiStatus.error}</AlertDescription>
            </Alert>
          )}

          {apiStatus.lastChecked && (
            <p className="text-xs text-gray-500">마지막 확인: {apiStatus.lastChecked.toLocaleTimeString("ko-KR")}</p>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>서버 주소:</strong> http://localhost:8080
            </p>
            <p>
              <strong>API 엔드포인트:</strong> /api/v1
            </p>
          </div>

          {!apiStatus.isHealthy && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>API 서버 연결에 실패했습니다. 다음을 확인해주세요:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>서버가 localhost:8080에서 실행 중인지 확인</li>
                    <li>CORS 설정이 올바른지 확인</li>
                    <li>방화벽이나 보안 소프트웨어 확인</li>
                    <li>네트워크 연결 상태 확인</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

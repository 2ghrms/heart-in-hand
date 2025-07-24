"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  ArrowLeft,
  Calendar,
  PenTool,
  Loader2,
  Share2,
  Download,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { notesCache } from "@/lib/notes-cache"
import { dateUtils } from "@/lib/date-utils"
import { imageUtils } from "@/lib/image-utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/proxy"

interface NoteImage {
  imageId: number
  imageUrl: string
  analysisResult?: string
  noteImageStatus: "NOT_RECOGNIZED" | "DONE"
}

interface Note {
  noteId: number
  title: string
  content: string
  images: NoteImage[]
  createdAt: string
  updatedAt: string
}

export default function NoteDetailPage() {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReadingHeart, setIsReadingHeart] = useState(false)
  const [error, setError] = useState("")
  const [pollingCount, setPollingCount] = useState(0)
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  // 폴링 관리를 위한 ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    if (!noteId || noteId === "undefined" || noteId === "null") {
      setError("유효하지 않은 노트 ID입니다.")
      setIsLoading(false)
      return
    }

    fetchNote()

    return () => {
      isMountedRef.current = false
      if (pollingIntervalRef.current) {
        console.log("[노트상세] 컴포넌트 언마운트 - 폴링 정리")
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        isPollingRef.current = false
      }
    }
  }, [noteId])

  useEffect(() => {
    if (!isMountedRef.current || !note) return

    const hasUnreadImages = note.images?.some((img) => img.noteImageStatus === "NOT_RECOGNIZED") || false
    const hasImages = note.images && note.images.length > 0

    if (hasImages && hasUnreadImages && !isPollingRef.current) {
      console.log("[노트상세] 마음을 읽지 않은 손글씨 발견 - 폴링 시작")
      startPolling()
    } else if (!hasUnreadImages && isPollingRef.current) {
      console.log("[노트상세] 모든 마음 읽기 완료 - 폴링 중단")
      stopPolling()
    }
  }, [note])

  const startPolling = () => {
    if (isPollingRef.current || !isMountedRef.current) return

    isPollingRef.current = true
    setIsReadingHeart(true)
    setPollingCount(0)

    pollingIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        stopPolling()
        return
      }

      console.log("[노트상세] 마음 읽기 확인 중... (", pollingCount + 1, "회)")
      setPollingCount((prev) => prev + 1)

      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          stopPolling()
          return
        }

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!isMountedRef.current) {
          stopPolling()
          return
        }

        if (response.ok) {
          const data = await response.json()
          console.log("[노트상세] 폴링 응답:", data)

          const noteData = data.result || data
          const validatedNote: Note = {
            noteId: noteData.noteId || Number.parseInt(noteId),
            title: noteData.title || "제목 없음",
            content: noteData.content || "",
            images: noteData.images || [],
            createdAt: noteData.createdAt || new Date().toISOString(),
            updatedAt: noteData.updatedAt || noteData.createdAt || new Date().toISOString(),
          }

          const hasNewHeartReading = validatedNote.images.some((img, index) => {
            const oldImg = note?.images?.[index]
            return img.noteImageStatus === "DONE" && oldImg?.noteImageStatus === "NOT_RECOGNIZED"
          })

          if (hasNewHeartReading) {
            console.log("[노트상세] 새로운 마음 읽기 완료!")
          }

          notesCache.updateNote(validatedNote)
          setNote(validatedNote)

          const allRead = validatedNote.images.every((img) => img.noteImageStatus === "DONE")
          if (allRead || validatedNote.images.length === 0) {
            console.log("[노트상세] 모든 마음 읽기 완료 - 폴링 중단")
            stopPolling()
          }
        } else if (response.status === 401 || response.status === 403) {
          console.log("[노트상세] 인증 에러 - 폴링 중단")
          stopPolling()
        }
      } catch (error) {
        console.error("[노트상세] 폴링 에러:", error)
      }
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    isPollingRef.current = false
    setIsReadingHeart(false)
    console.log("[노트상세] 폴링 중단됨")
  }

  const fetchNote = async () => {
    try {
      const cachedNote = notesCache.getNote(noteId)
      if (cachedNote) {
        console.log("[노트상세] 캐시된 노트 사용:", noteId)
        setNote(cachedNote)
        setIsLoading(false)
        return
      }

      console.log("[노트상세] API에서 노트 조회:", noteId)
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[노트상세] API 응답:", data)

        const noteData = data.result || data
        const validatedNote: Note = {
          noteId: noteData.noteId || Number.parseInt(noteId),
          title: noteData.title || "제목 없음",
          content: noteData.content || "",
          images: noteData.images || [],
          createdAt: noteData.createdAt || new Date().toISOString(),
          updatedAt: noteData.updatedAt || noteData.createdAt || new Date().toISOString(),
        }

        notesCache.updateNote(validatedNote)
        setNote(validatedNote)
      } else if (response.status === 404) {
        setError("노트를 찾을 수 없습니다.")
      } else {
        setError("노트를 불러오는데 실패했습니다.")
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("정말로 이 소중한 추억을 삭제하시겠습니까?")) return

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        notesCache.deleteNote(noteId)
        router.push("/dashboard")
      } else {
        setError("노트 삭제에 실패했습니다.")
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.")
    }
  }

  const formatDate = (dateString: string) => {
    return dateUtils.formatDate(dateString, { includeTime: true })
  }

  const getHeartReadingStatus = () => {
    if (!note?.images || note.images.length === 0) return "no-images"

    const readCount = note.images.filter((img) => img.noteImageStatus === "DONE").length
    const totalCount = note.images.length

    if (readCount === totalCount) return "all-done"
    if (readCount > 0) return "partial"
    return "none"
  }

  const getReadImages = () => note?.images?.filter((img) => img.noteImageStatus === "DONE") || []
  const getUnreadImages = () => note?.images?.filter((img) => img.noteImageStatus === "NOT_RECOGNIZED") || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">손글씨를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md border-rose-100">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button className="bg-rose-500 hover:bg-rose-600">마음 보관함으로</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const heartReadingStatus = getHeartReadingStatus()
  const readImages = getReadImages()
  const unreadImages = getUnreadImages()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-rose-600 hover:text-rose-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                마음 보관함
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-rose-500" />
                <span className="font-semibold text-gray-900">손글씨 상세</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                공유
              </Button>
              <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
              <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                편집
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-red-200 text-red-600 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Note Header */}
            <Card className="border-rose-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2 text-gray-900">{note.title || "제목 없음"}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 text-base text-rose-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        간직한 날: {formatDate(note.createdAt)}
                      </span>
                      {note.updatedAt !== note.createdAt && (
                        <span className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          수정: {formatDate(note.updatedAt)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {note.images && note.images.length > 0 && (
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-200">
                        <PenTool className="h-3 w-3 mr-1" />
                        손글씨 {note.images.length}개
                      </Badge>
                    )}
                    {heartReadingStatus === "all-done" && (
                      <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                        <Heart className="h-3 w-3 mr-1" />
                        마음 읽기 완료
                      </Badge>
                    )}
                    {heartReadingStatus === "partial" && (
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        <Heart className="h-3 w-3 mr-1" />
                        부분 완료
                      </Badge>
                    )}
                    {isReadingHeart && (
                      <Badge variant="outline" className="animate-pulse border-rose-300 text-rose-700">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        마음 읽는 중
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Images Section */}
            {note.images && note.images.length > 0 && (
              <Card className="border-rose-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center text-rose-900">
                    <PenTool className="h-5 w-5 mr-2" />
                    소중한 손글씨 ({note.images.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {note.images.map((image, index) => (
                      <div key={image.imageId} className="relative">
                        <img
                          src={imageUtils.normalizeImageUrl(image.imageUrl) || "/placeholder.svg"}
                          alt={`손글씨 ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-rose-200"
                          onError={imageUtils.handleImageError}
                          onLoad={imageUtils.handleImageLoad}
                        />
                        <div className="absolute top-2 right-2">
                          {image.noteImageStatus === "DONE" ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              완료
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-white border-orange-300 text-orange-700">
                              <Clock className="h-3 w-3 mr-1" />
                              대기중
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Section */}
            <Card className="border-rose-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900">이야기</CardTitle>
              </CardHeader>
              <CardContent>
                {note.content ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">아직 이야기가 없어요.</p>
                )}
              </CardContent>
            </Card>

            {/* Heart Reading Results */}
            {readImages.length > 0 && (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center text-orange-900">
                    <Sparkles className="h-5 w-5 mr-2" />
                    손글씨에서 찾은 마음 ({readImages.length}개)
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    손글씨에 담긴 소중한 마음을 읽어드렸어요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {readImages.map((image, index) => (
                    <div key={image.imageId} className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-orange-800">손글씨 {index + 1}에서 찾은 마음</span>
                      </div>
                      <div className="prose max-w-none">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {image.analysisResult || "마음을 읽지 못했어요."}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Reading Heart State */}
            {isReadingHeart && unreadImages.length > 0 && (
              <Card className="border-rose-200 bg-rose-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 text-rose-600 animate-spin" />
                    <div className="flex-1">
                      <p className="font-medium text-rose-800">손글씨에 담긴 마음을 읽고 있어요</p>
                      <p className="text-sm text-rose-700">
                        읽을 손글씨: {unreadImages.length}개 | 확인 횟수: {pollingCount}회
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-rose-600">💕 마음 읽기가 완료되면 자동으로 결과를 보여드려요</div>
                </CardContent>
              </Card>
            )}

            {/* No Reading Yet */}
            {heartReadingStatus === "none" && !isReadingHeart && note.images && note.images.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">아직 마음 읽기를 시작하지 않았어요</p>
                      <p className="text-sm text-yellow-700">
                        곧 손글씨에 담긴 마음을 읽어드릴게요. 잠시만 기다려주세요.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-rose-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent border-rose-200 text-rose-600">
                  <Edit className="h-4 w-4 mr-2" />
                  이야기 편집
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent border-rose-200 text-rose-600">
                  <Share2 className="h-4 w-4 mr-2" />
                  추억 공유하기
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent border-rose-200 text-rose-600">
                  <Download className="h-4 w-4 mr-2" />
                  다운로드
                </Button>
              </CardContent>
            </Card>

            {/* Note Info */}
            <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-orange-900">추억 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">간직한 날</span>
                  <span className="text-sm font-medium">{formatDate(note.createdAt)}</span>
                </div>
                {note.updatedAt !== note.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">수정한 날</span>
                    <span className="text-sm font-medium">{formatDate(note.updatedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">손글씨</span>
                  <span className="text-sm font-medium">{note.images?.length || 0}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">마음 읽기 완료</span>
                  <span className="text-sm font-medium">{readImages.length}개</span>
                </div>
                {isReadingHeart && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">확인 횟수</span>
                    <span className="text-sm font-medium">{pollingCount}회</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Heart Reading Status */}
            <Card
              className={
                heartReadingStatus === "all-done"
                  ? "border-green-200 bg-green-50"
                  : isReadingHeart
                    ? "border-rose-200 bg-rose-50"
                    : "border-gray-200 bg-white/80 backdrop-blur-sm"
              }
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  마음 읽기 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                {heartReadingStatus === "all-done" ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">모든 마음 읽기 완료</span>
                  </div>
                ) : heartReadingStatus === "partial" ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-800 font-medium">부분 완료</span>
                    </div>
                    <div className="text-sm text-orange-700">
                      <p>• 완료: {readImages.length}개</p>
                      <p>• 대기: {unreadImages.length}개</p>
                    </div>
                  </div>
                ) : isReadingHeart ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 text-rose-600 animate-spin" />
                      <span className="text-rose-800 font-medium">마음 읽는 중</span>
                    </div>
                    <div className="text-sm text-rose-700">
                      <p>• 2초마다 상태 확인 중</p>
                      <p>• 완료되면 자동으로 결과 표시</p>
                      <p>• 현재 {pollingCount}회 확인됨</p>
                    </div>
                  </div>
                ) : note.images && note.images.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-800 font-medium">마음 읽기 대기 중</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      <p>곧 손글씨에 담긴 마음을 읽어드릴게요.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-800 font-medium">손글씨가 없어요</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Actions */}
            <Card className="border-purple-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-purple-900">관련 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/notes/create">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-purple-200 text-purple-600"
                  >
                    <PenTool className="h-4 w-4 mr-2" />새 손글씨 간직하기
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-purple-200 text-purple-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    모든 추억 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

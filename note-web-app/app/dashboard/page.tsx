"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  Plus,
  Search,
  PenTool,
  Calendar,
  MoreVertical,
  LogOut,
  User,
  Settings,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authUtils } from "@/lib/auth-utils"
import { safeArrayUtils } from "@/lib/safe-array-utils"
import { notesCache } from "@/lib/notes-cache"
import { dateUtils } from "@/lib/date-utils"
import { imageUtils } from "@/lib/image-utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/proxy"

interface Note {
  noteId: number
  title: string
  content: string
  images?: Array<{
    imageId: number
    imageUrl: string
    analysisResult?: string
    noteImageStatus: "NOT_RECOGNIZED" | "DONE"
  }>
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({ name: "사용자", email: "user@example.com" })
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // 클라이언트 사이드 마운트 확인
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 브라우저 탭 타이틀 설정
  useEffect(() => {
    document.title = "대시보드 - 손마음"
  }, [])

  // 데이터 로딩
  useEffect(() => {
    if (!isClient) return

    // 인증 확인
    if (!authUtils.isTokenValid()) {
      router.push("/auth/login")
      return
    }

    fetchNotes()
    fetchUserInfo()
  }, [isClient, router])

  const fetchNotes = async () => {
    if (!authUtils.isClient()) return

    // 먼저 캐시된 데이터 확인
    const cachedNotes = notesCache.getNotes()
    if (cachedNotes.length > 0) {
      console.log("[대시보드] 캐시된 노트 사용")
      setNotes(cachedNotes)
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/auth/login")
        return
      }

      console.log("[대시보드] API에서 노트 목록 요청 중...")

      const response = await fetch(`${API_BASE_URL}/notes/my-notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[대시보드] API 응답:", data)

        // 🔥 API 명세에 맞게 데이터 정규화
        const notesArray = Array.isArray(data) ? data : data.result || []

        const validatedNotes = notesArray.map((note: any) => ({
          noteId: note.noteId || note.id,
          title: note.title || "제목 없음",
          content: note.content || "",
          images: note.images || [],
          // 🔥 API 명세에 맞게 createdAt 필드 처리
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || note.createdAt || new Date().toISOString(),
        }))

        console.log("[대시보드] 정규화된 노트:", validatedNotes)

        // 🔥 캐시에 저장
        notesCache.saveNotes(validatedNotes)
        setNotes(validatedNotes)
      } else if (response.status === 401 || response.status === 403) {
        console.log("[대시보드] 인증 에러 - 로그아웃 처리")
        authUtils.logout("세션이 만료되었습니다.")
      } else {
        console.error("[대시보드] 노트 조회 실패:", response.status)
        setNotes([])
      }
    } catch (error) {
      console.error("[대시보드] 노트 조회 에러:", error)
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserInfo = async () => {
    if (!authUtils.isClient()) return

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/members/my-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.isSuccess && data.result) {
          setUser({
            name: data.result.name || "사용자",
            email: data.result.email || "user@example.com",
          })

          // 이름이 없으면 프로필 완성 페이지로 리디렉션
          if (!data.result.name) {
            router.push("/auth/complete-profile")
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        authUtils.logout("세션이 만료되었습니다.")
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
    }
  }

  const handleLogout = async () => {
    if (!authUtils.isClient()) return

    try {
      const token = localStorage.getItem("accessToken")
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      authUtils.logout()
    }
  }

  const deleteNote = async (noteId: number) => {
    if (!authUtils.isClient()) return

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        // 🔥 캐시에서도 삭제
        notesCache.deleteNote(noteId.toString())
        // 🔥 상태 업데이트
        setNotes((prevNotes) => safeArrayUtils.safeFilter(prevNotes, (note) => note.noteId !== noteId))
      } else if (response.status === 401 || response.status === 403) {
        authUtils.logout("세션이 만료되었습니다.")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  // 🔥 안전한 필터링 (toLowerCase 에러 방지)
  const filteredNotes = safeArrayUtils.safeStringFilter(notes, searchQuery, (note) => [
    note.title || "",
    note.content || "",
    // 이미지 분석 결과도 검색 대상에 포함
    ...(note.images?.map((img) => img.analysisResult || "") || []),
  ])

  const formatDate = (dateString: string) => {
    return dateUtils.formatDate(dateString)
  }

  // 🔥 안전한 통계 계산 - API 명세에 맞게 수정
  const totalNotes = safeArrayUtils.safeLength(notes)
  const treasuredNotes = safeArrayUtils.safeFilter(
    notes,
    (note) => note.images?.some((img) => img.noteImageStatus === "DONE") || false,
  ).length
  const recentNotes = safeArrayUtils.safeFilter(notes, (note) => {
    try {
      const noteDate = new Date(note.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return noteDate > weekAgo
    } catch (error) {
      return false
    }
  }).length

  // 🔥 노트에 이미지가 있는지 확인하는 헬퍼 함수
  const hasImages = (note: Note) => note.images && note.images.length > 0
  const hasTreasuredImages = (note: Note) => note.images?.some((img) => img.noteImageStatus === "DONE") || false

  // 🔥 안전한 이미지 URL 처리
  const getFirstImageUrl = (note: Note) => {
    const firstImage = note.images?.[0]
    if (!firstImage) return null

    const normalizedUrl = imageUtils.normalizeImageUrl(firstImage.imageUrl)
    imageUtils.debugImageUrl(firstImage.imageUrl, normalizedUrl)
    return normalizedUrl
  }

  // 클라이언트 사이드 렌더링 전에는 로딩 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-rose-500" />
                <span className="text-2xl font-bold text-gray-900">손마음</span>
              </Link>
              <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-200">
                마음 보관함
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/notes/create">
                <Button className="bg-rose-500 hover:bg-rose-600">
                  <Plus className="h-4 w-4 mr-2" />새 손글씨 간직하기
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user.name} />
                      <AvatarFallback className="bg-rose-100 text-rose-700">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">안녕하세요, {user.name}님! 💕</h1>
          <p className="text-gray-600">소중한 손글씨들을 마음과 함께 간직하고 추억을 되새겨보세요.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 border-rose-100 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-rose-700">간직한 손글씨</span>
              <PenTool className="h-3 w-3 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-gray-900">{totalNotes}</div>
            <p className="text-xs text-rose-600">소중한 추억</p>
          </Card>

          <Card className="p-3 border-orange-100 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-orange-700">마음 간직</span>
              <Heart className="h-3 w-3 text-orange-400" />
            </div>
            <div className="text-xl font-bold text-gray-900">{treasuredNotes}</div>
            <p className="text-xs text-orange-600">보관 완료</p>
          </Card>

          <Card className="p-3 border-purple-100 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-purple-700">이번 주</span>
              <Calendar className="h-3 w-3 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-gray-900">{recentNotes}</div>
            <p className="text-xs text-purple-600">새로운 추억</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 h-4 w-4" />
            <Input
              placeholder="손글씨 추억 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-rose-200 focus:border-rose-400 bg-white/70 backdrop-blur-sm"
            />
          </div>
          <Link href="/notes/create">
            <Button className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600">
              <Plus className="h-4 w-4 mr-2" />새 손글씨 간직하기
            </Button>
          </Link>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-rose-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-4 bg-rose-200 rounded w-3/4"></div>
                  <div className="h-3 bg-rose-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-rose-200 rounded mb-4"></div>
                  <div className="h-3 bg-rose-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-rose-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className="text-center py-12 border-rose-100 bg-white/70 backdrop-blur-sm">
            <CardContent>
              <Heart className="h-16 w-16 text-rose-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "찾는 추억이 없어요" : "아직 간직한 손글씨가 없어요"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? "다른 키워드로 검색해보세요" : "첫 번째 소중한 손글씨를 간직해보세요"}
              </p>
              {!searchQuery && (
                <Link href="/notes/create">
                  <Button className="bg-rose-500 hover:bg-rose-600">
                    <Plus className="h-4 w-4 mr-2" />첫 손글씨 간직하기
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.noteId}
                className="hover:shadow-lg transition-all duration-200 border-rose-100 bg-white/70 backdrop-blur-sm hover:bg-white/90"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1 text-gray-900">{note.title || "제목 없음"}</CardTitle>
                      <CardDescription className="flex items-center mt-1 text-rose-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        {dateUtils.formatDate(note.createdAt)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/notes/${note.noteId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            보기
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteNote(note.noteId)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasImages(note) && (
                    <div className="mb-3">
                      <img
                        src={getFirstImageUrl(note) || "/placeholder.svg"}
                        alt="손글씨 이미지"
                        className="w-full h-32 object-cover rounded-md border border-rose-100"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{note.content || "내용 없음"}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {hasImages(note) && (
                        <Badge variant="secondary" className="text-xs bg-rose-100 text-rose-700 border-rose-200">
                          <PenTool className="h-3 w-3 mr-1" />
                          손글씨
                        </Badge>
                      )}
                      {hasTreasuredImages(note) && (
                        <Badge variant="default" className="text-xs bg-orange-500 hover:bg-orange-600">
                          <Heart className="h-3 w-3 mr-1" />
                          마음 간직
                        </Badge>
                      )}
                    </div>
                    <Link href={`/notes/${note.noteId}`}>
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">
                        보기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

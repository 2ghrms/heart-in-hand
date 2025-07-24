"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Upload, PenTool, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { notesCache } from "@/lib/notes-cache"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/proxy"

export default function CreateNotePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const MAX_IMAGES = 10
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addImages(files)
  }

  const addImages = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name}은(는) 10MB를 초과합니다.`)
        return false
      }
      if (!file.type.startsWith("image/")) {
        setError(`${file.name}은(는) 이미지 파일이 아닙니다.`)
        return false
      }
      return true
    })

    if (images.length + validFiles.length > MAX_IMAGES) {
      setError(`최대 ${MAX_IMAGES}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    const newImages = [...images, ...validFiles]
    setImages(newImages)

    // 미리보기 생성
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    setError("")
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Drag & Drop 핸들러들
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    addImages(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("제목을 입력해주세요.")
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()

      formData.append("title", title)
      formData.append("content", content)
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })

      // 🔥 노트 생성 (서버에서 자동으로 분석 시작)
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const noteData = await response.json()
        console.log("[노트생성] 성공:", noteData)

        // 🔥 API 응답에서 noteId 정확히 추출
        let extractedNoteId = null

        // 다양한 응답 구조에 대응
        if (noteData.noteId) {
          extractedNoteId = noteData.noteId
        } else if (noteData.result && noteData.result.noteId) {
          extractedNoteId = noteData.result.noteId
        } else if (noteData.id) {
          extractedNoteId = noteData.id
        } else if (noteData.result && noteData.result.id) {
          extractedNoteId = noteData.result.id
        }

        console.log("[노트생성] 추출된 noteId:", extractedNoteId)

        if (!extractedNoteId) {
          console.error("[노트생성] noteId를 찾을 수 없음:", noteData)
          setError("노트 생성은 성공했지만 ID를 가져올 수 없습니다.")
          return
        }

        // 🔥 API 명세에 맞게 데이터 정규화
        const validatedNote = {
          noteId: extractedNoteId,
          title: noteData.title || noteData.result?.title || title,
          content: noteData.content || noteData.result?.content || content,
          images: noteData.images || noteData.result?.images || [],
          createdAt: noteData.createdAt || noteData.result?.createdAt || new Date().toISOString(),
          updatedAt:
            noteData.updatedAt ||
            noteData.result?.updatedAt ||
            noteData.createdAt ||
            noteData.result?.createdAt ||
            new Date().toISOString(),
        }

        console.log("[노트생성] 정규화된 노트:", validatedNote)

        // 🔥 캐시에 새 노트 추가
        notesCache.updateNote(validatedNote)

        if (images.length > 0) {
          setSuccess("손글씨가 간직되었어요! 마음을 읽어드릴게요.")
        } else {
          setSuccess("소중한 추억이 성공적으로 간직되었어요!")
        }

        // 🔥 확실한 noteId로 리디렉션
        console.log("[노트생성] 리디렉션 준비:", `/notes/${extractedNoteId}`)

        setTimeout(() => {
          console.log("[노트생성] 리디렉션 실행:", `/notes/${extractedNoteId}`)
          router.push(`/notes/${extractedNoteId}`)
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "노트 생성에 실패했습니다.")
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-rose-600 hover:text-rose-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                마음 보관함으로
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-rose-500" />
              <span className="text-xl font-bold text-gray-900">새로운 손글씨 간직하기</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-rose-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-rose-900 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-rose-500" />
                  소중한 손글씨 간직하기
                </CardTitle>
                <CardDescription>
                  제목과 이야기를 적고, 손글씨 사진을 올려주세요. 마음이 담긴 글씨를 영원히 간직해드릴게요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                      id="title"
                      placeholder="예: 엄마의 편지, 연인의 메모, 친구의 쪽지..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="text-lg border-rose-200 focus:border-rose-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">이야기</Label>
                    <Textarea
                      id="content"
                      placeholder="이 손글씨에 담긴 특별한 이야기나 추억을 들려주세요..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="resize-none border-rose-200 focus:border-rose-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">손글씨 사진 (최대 {MAX_IMAGES}개)</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver ? "border-rose-400 bg-rose-50" : "border-rose-300 hover:border-rose-400 bg-white/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        {images.length === 0 ? (
                          <div className="space-y-4">
                            <Upload className="h-12 w-12 text-rose-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-900">소중한 손글씨 사진을 올려주세요</p>
                              <p className="text-sm text-gray-600">
                                PNG, JPG, GIF 파일 (최대 10MB, {MAX_IMAGES}개까지)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              더 많은 손글씨 사진 추가하기 ({images.length}/{MAX_IMAGES})
                            </p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* 이미지 미리보기 그리드 */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`손글씨 미리보기 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-rose-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isLoading} className="flex-1 bg-rose-500 hover:bg-rose-600">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          간직하는 중...
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          손글씨 간직하기
                        </>
                      )}
                    </Button>
                    <Link href="/dashboard">
                      <Button type="button" variant="outline" className="border-rose-200 text-rose-600 bg-transparent">
                        취소
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="border-rose-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-rose-900">
                  <Heart className="h-5 w-5 mr-2 text-rose-500" />
                  손글씨 보관 팁
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start">
                    <span className="text-rose-500 mr-2">💕</span>
                    밝고 선명한 곳에서 촬영해주세요
                  </p>
                  <p className="flex items-start">
                    <span className="text-rose-500 mr-2">💕</span>
                    그림자가 없도록 주의해주세요
                  </p>
                  <p className="flex items-start">
                    <span className="text-rose-500 mr-2">💕</span>
                    한글, 영어, 숫자 모두 간직할 수 있어요
                  </p>
                  <p className="flex items-start">
                    <span className="text-rose-500 mr-2">💕</span>
                    마음이 담긴 모든 글씨를 소중히 보관해드려요
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {(title || content || imagePreviews.length > 0) && (
              <Card className="border-orange-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-900">미리보기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {title && (
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                    </div>
                  )}
                  {imagePreviews.length > 0 && (
                    <div>
                      <div className="grid grid-cols-2 gap-1">
                        {imagePreviews.slice(0, 4).map((preview, index) => (
                          <img
                            key={index}
                            src={preview || "/placeholder.svg"}
                            alt={`미리보기 ${index + 1}`}
                            className="w-full h-16 object-cover rounded-md border border-orange-200"
                          />
                        ))}
                      </div>
                      {imagePreviews.length > 4 && (
                        <p className="text-xs text-gray-500 mt-1">+{imagePreviews.length - 4}개 더</p>
                      )}
                    </div>
                  )}
                  {content && (
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-4">{content}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {imagePreviews.length > 0 && (
                      <span className="flex items-center text-rose-600">
                        <PenTool className="h-3 w-3 mr-1" />
                        손글씨 {images.length}개
                      </span>
                    )}
                    {imagePreviews.length > 0 && (
                      <span className="flex items-center text-orange-600">
                        <Heart className="h-3 w-3 mr-1" />
                        마음 간직 예정
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Card */}
            <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900">손마음의 특별함</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-rose-900">감정 보관</p>
                    <p className="text-xs text-rose-700">손글씨에 담긴 마음을 그대로</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <PenTool className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-orange-900">추억 아카이브</p>
                    <p className="text-xs text-orange-700">소중한 순간들을 영원히</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-purple-900">마음 읽기</p>
                    <p className="text-xs text-purple-700">글씨 속 마음을 찾아드려요</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

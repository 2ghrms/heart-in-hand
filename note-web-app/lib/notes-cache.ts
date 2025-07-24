// 노트 캐싱 관리 유틸리티
interface Note {
  noteId: number // 🔥 API 명세에 맞게 수정
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

export const notesCache = {
  // 캐시 키
  CACHE_KEY: "noteai_notes_cache",
  CACHE_TIMESTAMP_KEY: "noteai_notes_cache_timestamp",
  CACHE_DURATION: 5 * 60 * 1000, // 5분

  // 클라이언트 사이드 체크
  isClient: () => typeof window !== "undefined",

  // 노트 리스트 저장
  saveNotes: (notes: Note[]) => {
    if (!notesCache.isClient()) return

    try {
      localStorage.setItem(notesCache.CACHE_KEY, JSON.stringify(notes))
      localStorage.setItem(notesCache.CACHE_TIMESTAMP_KEY, Date.now().toString())
      console.log("[노트캐시] 노트 리스트 저장 완료:", notes.length, "개")
    } catch (error) {
      console.error("[노트캐시] 저장 실패:", error)
    }
  },

  // 노트 리스트 조회
  getNotes: (): Note[] => {
    if (!notesCache.isClient()) return []

    try {
      const cached = localStorage.getItem(notesCache.CACHE_KEY)
      const timestamp = localStorage.getItem(notesCache.CACHE_TIMESTAMP_KEY)

      if (!cached || !timestamp) {
        console.log("[노트캐시] 캐시된 데이터 없음")
        return []
      }

      // 캐시 만료 확인
      const cacheAge = Date.now() - Number.parseInt(timestamp)
      if (cacheAge > notesCache.CACHE_DURATION) {
        console.log("[노트캐시] 캐시 만료됨 (", Math.round(cacheAge / 1000), "초 경과)")
        notesCache.clearCache()
        return []
      }

      const notes = JSON.parse(cached)
      console.log("[노트캐시] 캐시된 노트 조회:", notes.length, "개")
      return notes
    } catch (error) {
      console.error("[노트캐시] 조회 실패:", error)
      return []
    }
  },

  // 특정 노트 조회
  getNote: (noteId: string): Note | null => {
    const notes = notesCache.getNotes()
    // 🔥 noteId를 number로 변환해서 비교
    const note = notes.find((n) => n.noteId.toString() === noteId)

    if (note) {
      console.log("[노트캐시] 캐시에서 노트 찾음:", noteId)
    } else {
      console.log("[노트캐시] 캐시에서 노트 없음:", noteId)
    }

    return note || null
  },

  // 노트 추가/업데이트
  updateNote: (note: Note) => {
    if (!notesCache.isClient()) return

    // 🔥 noteId 검증 강화
    if (!note.noteId || note.noteId === undefined || note.noteId === null) {
      console.error("[노트캐시] 유효하지 않은 noteId:", note)
      return
    }

    const notes = notesCache.getNotes()
    const existingIndex = notes.findIndex((n) => n.noteId === note.noteId)

    if (existingIndex >= 0) {
      notes[existingIndex] = note
      console.log("[노트캐시] 노트 업데이트:", note.noteId)
    } else {
      notes.unshift(note) // 새 노트는 맨 앞에 추가
      console.log("[노트캐시] 노트 추가:", note.noteId)
    }

    notesCache.saveNotes(notes)
  },

  // 노트 삭제
  deleteNote: (noteId: string) => {
    if (!notesCache.isClient()) return

    const notes = notesCache.getNotes()
    // 🔥 noteId를 number로 변환해서 비교
    const filteredNotes = notes.filter((n) => n.noteId.toString() !== noteId)

    if (filteredNotes.length !== notes.length) {
      notesCache.saveNotes(filteredNotes)
      console.log("[노트캐시] 노트 삭제:", noteId)
    }
  },

  // 캐시 클리어
  clearCache: () => {
    if (!notesCache.isClient()) return

    localStorage.removeItem(notesCache.CACHE_KEY)
    localStorage.removeItem(notesCache.CACHE_TIMESTAMP_KEY)
    console.log("[노트캐시] 캐시 클리어 완료")
  },

  // 캐시 상태 확인
  getCacheInfo: () => {
    if (!notesCache.isClient()) return null

    const timestamp = localStorage.getItem(notesCache.CACHE_TIMESTAMP_KEY)
    const notes = notesCache.getNotes()

    return {
      hasCache: !!timestamp,
      cacheAge: timestamp ? Date.now() - Number.parseInt(timestamp) : 0,
      notesCount: notes.length,
      isExpired: timestamp ? Date.now() - Number.parseInt(timestamp) > notesCache.CACHE_DURATION : true,
    }
  },
}

// 배열 안전 처리 유틸리티
export const safeArrayUtils = {
  isArray(value: any): value is any[] {
    return Array.isArray(value)
  },

  safeFilter<T>(array: T[] | null | undefined, predicate: (item: T) => boolean): T[] {
    if (!Array.isArray(array)) {
      console.warn("[SafeArray] filter 대상이 배열이 아님:", array)
      return []
    }
    return array.filter(predicate)
  },

  safeMap<T, R>(array: T[] | null | undefined, mapper: (item: T, index: number) => R): R[] {
    if (!Array.isArray(array)) {
      console.warn("[SafeArray] map 대상이 배열이 아님:", array)
      return []
    }
    return array.map(mapper)
  },

  safeLength(array: any[] | null | undefined): number {
    if (!Array.isArray(array)) {
      return 0
    }
    return array.length
  },

  normalizeApiResponse(response: any): any[] {
    if (Array.isArray(response)) return response
    if (response && typeof response === 'object') {
      if (Array.isArray(response.result)) return response.result
      if (Array.isArray(response.data)) return response.data
      if (Array.isArray(response.items)) return response.items
      if (Array.isArray(response.list)) return response.list
    }
    console.warn("[SafeArray] 배열로 변환할 수 없는 응답:", response)
    return []
  },

  safeStringFilter<T>(
    array: T[] | null | undefined,
    searchQuery: string,
    getSearchFields: (item: T) => string[]
  ): T[] {
    if (!Array.isArray(array)) {
      console.warn("[SafeArray] filter 대상이 배열이 아님:", array)
      return []
    }

    if (!searchQuery || searchQuery.trim() === '') return array

    const normalizedQuery = searchQuery.toLowerCase().trim()

    return array.filter((item) => {
      try {
        const searchFields = getSearchFields(item)
        return searchFields.some((field) => {
          const safeField = field || ''
          return safeField.toLowerCase().includes(normalizedQuery)
        })
      } catch (error) {
        console.warn("[SafeArray] 필터링 중 에러:", error, item)
        return false
      }
    })
  }
}

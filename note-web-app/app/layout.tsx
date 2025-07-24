import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '손마음 - 소중한 손글씨를 마음과 함께',
  description: '손글씨에 담긴 소중한 마음을 AI와 함께 읽고 간직하는 특별한 공간',
  generator: '손마음',
  keywords: '손글씨, AI, 마음, 추억, 필기인식',
  authors: [{ name: '손마음 팀' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/placeholder-logo.svg" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jimooninsik.vercel.app"),
  title: "지문인식 예약 신청 서비스",
  description: "로그인 없이 바로 날짜를 확인하는 예약 캘린더",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "지문인식 예약 신청 서비스",
    description:
      "공개 예약 신청과 지점, 파티, 정원 관리를 지원하는 Supabase 기반 운영 서비스",
    url: "/",
    siteName: "지문인식 예약 신청 서비스",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/jimuninsik-suwon-logo.png",
        width: 417,
        height: 273,
        alt: "지문인식 예약 신청 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "지문인식 예약 신청 서비스",
    description:
      "공개 예약 신청과 지점, 파티, 정원 관리를 지원하는 Supabase 기반 운영 서비스",
    images: ["/jimuninsik-suwon-logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

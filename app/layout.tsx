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
  title: "LAST CONTINUE | 次の1PLAY、誰が挑戦する？",
  description: "3〜4人で遊ぶ心理戦カードゲーム「LAST CONTINUE」。GOODとBADが混ざったステージデッキから引くか、他人に引かせるかの究極の駆け引き。",
  openGraph: {
    title: "LAST CONTINUE | 次の1PLAY、誰が挑戦する？",
    description: "3〜4人で遊ぶ心理戦カードゲーム「LAST CONTINUE」",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

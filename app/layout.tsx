import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "واژه‌خانه | جدول کلمات متقاطع فارسی",
  description: "نسخهٔ آزمایشی یک جدول کلمات متقاطع فارسی ساده و واکنش‌گرا",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5efe4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

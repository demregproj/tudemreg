import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "REGPLANing ✔",
  description: "ทดลองจัดตารางเรียนและวางแผนการเรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-gray-50 min-h-screen flex flex-col font-sans">
        {/* Navbar จะแสดงอยู่ด้านบนสุดของทุกหน้า */}
        <Navbar />
        
        {/* พื้นที่สำหรับแสดงเนื้อหาของแต่ละหน้า (เช่น ตารางเรียน หรือ แผนการเรียน) */}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
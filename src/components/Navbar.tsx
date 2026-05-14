"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1E0B99] text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* โลโก้ด้านซ้าย */}
      <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
        <h1 className="text-3xl font-black italic tracking-tighter drop-shadow-md">
          <span className="text-[#FBBF24]">TUDEM</span>
          <span className="text-white">REG</span>
        </h1>
        <span className="text-[#4ADE80] text-2xl font-black drop-shadow-md">✓</span>
      </Link>

      {/* เมนูตรงกลาง & โปรไฟล์ด้านขวา */}
      <div className="flex items-center gap-4">
        {/* ปุ่มวางแผนการเรียน */}
        <Link 
          href="/plan" 
          className={`px-5 py-2 rounded-full font-bold text-sm transition-all border-2 ${
            pathname === "/plan" 
              ? "bg-white/20 border-white/40 shadow-inner" 
              : "border-transparent text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          วางแผนการเรียน
        </Link>

        {/* ปุ่มจัดตารางเรียน */}
        <Link 
          href="/" 
          className={`px-5 py-2 rounded-full font-bold text-sm transition-all border-2 ${
            pathname === "/" 
              ? "bg-white/20 border-white/40 shadow-inner" 
              : "border-transparent text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          จัดตารางเรียน
        </Link>

        {/* ไอคอนโปรไฟล์ */}
        <button className="w-10 h-10 rounded-full bg-white border-2 border-transparent hover:border-blue-300 flex items-center justify-center text-[#1E0B99] overflow-hidden ml-2 transition-all shadow-sm">
          {/* ใช้ SVG รูปคนแบบมินิมอล */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mt-2">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
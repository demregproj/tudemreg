"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("regplan_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    else setUser(null);
  }, [pathname]);

  const confirmLogout = () => {
    localStorage.removeItem("regplan_user");
    setUser(null);
    setShowLogoutConfirm(false);
    router.push("/"); 
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 text-gray-900 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-[100]">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <h1 className="text-2xl font-black italic tracking-tighter text-[#1E0B99]">
            <span className="text-[#FBBF24]">REG</span>PLANing
          </h1>
          <span className="text-2xl font-black text-green-500 -mt-1">✔</span>
        </Link>

        {/* Menu Nav */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/timetable" className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${pathname === "/timetable" ? "bg-[#1E0B99] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>
            จัดตารางเรียน
          </Link>
          <Link href="/plan" className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${pathname === "/plan" ? "bg-[#1E0B99] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>
            วางแผนการเรียน
          </Link>

          <div className="w-[2px] h-6 bg-gray-200 mx-2 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-4 pl-2">
              <span className="hidden md:block text-xs font-bold text-[#1E0B99] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                คุณ {user.user_metadata?.full_name || user.full_name}
              </span>
              
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="flex items-center gap-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="pl-2">
               <Link href="/login" className="bg-[#1E0B99] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md">
                 Log-in
               </Link>
            </div>
          )}
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 text-red-500 mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">ต้องการออกจากระบบ?</h3>
            <p className="text-sm font-bold text-gray-500 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 leading-relaxed">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบในขณะนี้?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest">ยกเลิก</button>
              <button onClick={confirmLogout} className="flex-1 py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-100">ยืนยัน Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
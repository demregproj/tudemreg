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
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 text-gray-900 px-4 md:px-6 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 shadow-sm sticky top-0 z-[100]">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-[#1E0B99]">
            <span className="text-[#FBBF24]">REG</span>PLANing
          </h1>
          <span className="text-xl md:text-2xl font-black text-green-500 -mt-1">✔</span>
        </Link>

        {/* Menu Nav (ปรับให้ปัดซ้ายขวาได้บนมือถือจอเล็กมาก) */}
        <div className="flex items-center gap-1.5 sm:gap-4 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          <Link href="/timetable" className={`shrink-0 px-3 py-2 md:px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${pathname === "/timetable" ? "bg-[#1E0B99] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>
            จัดตารางเรียน
          </Link>
          <Link href="/plan" className={`shrink-0 px-3 py-2 md:px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${pathname === "/plan" ? "bg-[#1E0B99] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>
            วางแผนการเรียน
          </Link>

          <div className="w-[2px] h-5 bg-gray-200 mx-1 md:mx-2 shrink-0"></div>

          {user ? (
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <span className="hidden lg:block text-xs font-bold text-[#1E0B99] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                คุณ {user.user_metadata?.full_name || user.full_name}
              </span>
              
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 px-3 py-2 md:px-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-sm transition-all"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="shrink-0">
               <Link href="/login" className="bg-[#1E0B99] text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md">
                 Log-in
               </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Modal ยืนยันการออกจากระบบ (ปรับให้พอดีจอมือถือ) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 md:p-10 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-red-50 text-red-500 mb-6">
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">ต้องการออกจากระบบ?</h3>
            <p className="text-xs md:text-sm font-bold text-gray-500 mb-8 bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 leading-relaxed">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบในขณะนี้?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full sm:flex-1 py-3 md:py-4 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest">ยกเลิก</button>
              <button onClick={confirmLogout} className="w-full sm:flex-1 py-3 md:py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-100">ยืนยัน Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
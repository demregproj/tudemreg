"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ใหม! State สำหรับแจ้งเตือน
  const [customAlert, setCustomAlert] = useState<{isOpen: boolean, type: 'success' | 'error', title: string, message: string, onConfirm?: () => void} | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('student_id', studentId)
        .eq('password', password)
        .single();

      if (error || !user) {
        throw new Error("รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง");
      }

      localStorage.setItem("regplan_user", JSON.stringify(user));
      
      setCustomAlert({
        isOpen: true, type: 'success', title: 'เข้าสู่ระบบสำเร็จ!', message: `ยินดีต้อนรับ คุณ ${user.full_name}`,
        onConfirm: () => { router.push("/plan"); router.refresh(); }
      });
    } catch (error: any) {
      setCustomAlert({ isOpen: true, type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border-2 border-gray-100 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-3 bg-[#1E0B99]"></div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">
            <span className="text-[#FBBF24]">REG</span><span className="text-[#1E0B99]">PLANing</span><span className="text-green-400 ml-1">✔</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Student Login System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase ml-1">รหัสนักศึกษา</label>
            <input type="text" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full mt-2 bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold focus:border-[#1E0B99] transition-all" placeholder="6602xxxxxx" />
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase ml-1">รหัสผ่าน</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-2 bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold focus:border-[#1E0B99] transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#1E0B99] text-white font-black text-lg rounded-2xl shadow-lg hover:-translate-y-1 transition-all disabled:bg-gray-400">
            {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t-2 border-gray-50 text-center flex flex-col gap-4">
          <p className="text-sm font-bold text-gray-500">ยังไม่มีบัญชีใช่ไหม? <Link href="/register" className="ml-2 text-[#1E0B99] hover:underline transition-all">สมัครสมาชิกที่นี่</Link></p>
          <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors">← กลับไปหน้าจัดตารางเรียน</Link>
        </div>
      </div>

      {/* 🟢 Custom Alert Modal */}
      {customAlert && customAlert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center animate-in fade-in zoom-in duration-200">
            <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${customAlert.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
              <span className="text-3xl">{customAlert.type === 'error' ? '❌' : '✅'}</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">{customAlert.title}</h3>
            <p className="text-sm font-bold text-gray-500 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">{customAlert.message}</p>
            <button 
              onClick={() => { if(customAlert.onConfirm) customAlert.onConfirm(); setCustomAlert(null); }} 
              className={`w-full py-4 font-black rounded-xl text-white transition-all uppercase tracking-widest text-xs shadow-lg ${customAlert.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              OKAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
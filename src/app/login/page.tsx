"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"TU" | "GENERAL">("TU");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{type: string, title: string, message: string} | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [selectedCurrId, setSelectedCurrId] = useState("");
  const [isCurrOpen, setIsCurrOpen] = useState(false);
  const [currSearch, setCurrSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurr = async () => {
      const { data } = await supabase.from("curriculums").select("*").order('academic_year', { ascending: false });
      if (data) setCurriculums(data);
    };
    fetchCurr();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      if (loginMode === "TU") {
        const tuRes = await fetch('/api/tu-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const tuData = await tuRes.json();

        if (tuData.success) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: tuData.email,
            password: tuData.syncPassword,
          });
          if (error) throw error;

          const { data: profile } = await supabase
            .from("profiles")
            .select("curriculum_id")
            .eq("id", data.user.id)
            .single();

          if (!profile?.curriculum_id) {
            setSelectedCurrId(tuData.suggestedCurrId || "");
            setCurrentUser(data.user);
            setShowConfirmModal(true);
          } else {
            localStorage.setItem("regplan_user", JSON.stringify(data.user));
            window.location.href = "/";
          }
        } else {
          throw new Error(tuData.message);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: profile } = await supabase
            .from("profiles")
            .select("curriculum_id")
            .eq("id", data.user.id)
            .single();

        if (!profile?.curriculum_id) {
          setSelectedCurrId("");
          setCurrentUser(data.user);
          setShowConfirmModal(true);
        } else {
          localStorage.setItem("regplan_user", JSON.stringify(data.user));
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      setAlert({ type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCurriculum = async () => {
    setIsLoading(true);
    try {
      if (!selectedCurrId) throw new Error("กรุณาเลือกหลักสูตรก่อนครับ");

      const { error } = await supabase
        .from("profiles")
        .update({ curriculum_id: selectedCurrId })
        .eq("id", currentUser.id);

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { curriculum_id: selectedCurrId }
      });

      const { data: { user } } = await supabase.auth.getUser();
      localStorage.setItem("regplan_user", JSON.stringify(user || currentUser));
      window.location.href = "/";
      
    } catch (err: any) {
      setAlert({ type: 'error', title: 'บันทึกไม่สำเร็จ', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-2 border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-[#1E0B99]"></div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">
            <span className="text-[#FBBF24]">REG</span><span className="text-[#1E0B99]">PLANing</span><span className="text-green-400 ml-1">✔</span>
          </h1>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button type="button" onClick={() => setLoginMode("TU")} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${loginMode === "TU" ? "bg-white text-red-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>นักศึกษา มธ.</button>
          <button type="button" onClick={() => setLoginMode("GENERAL")} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${loginMode === "GENERAL" ? "bg-white text-[#1E0B99] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>บุคคลทั่วไป</button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {loginMode === "TU" ? (
            <div>
              <label className="text-xs font-black text-red-600 uppercase ml-1">TU Username (รหัสนักศึกษา)</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-2 bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold focus:border-red-500 transition-all" placeholder="6602xxxxxx" />
            </div>
          ) : (
            <div>
              <label className="text-xs font-black text-gray-500 uppercase ml-1">อีเมลผู้ใช้งาน</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-2 bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold focus:border-[#1E0B99] transition-all" placeholder="yourname@example.com" />
            </div>
          )}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase ml-1">รหัสผ่าน</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-2 bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold focus:border-[#1E0B99]" placeholder="••••••••" />
          </div>
          
          {/* 🟢 ปุ่มเข้าสู่ระบบที่แก้ให้เปลี่ยนข้อความตามโหมด */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-4 text-white font-black text-lg rounded-2xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
              loginMode === 'TU' 
              ? 'bg-red-600 hover:bg-red-800' 
              : 'bg-[#1E0B99] hover:bg-black'
            }`}
          >
            {isLoading ? "กำลังตรวจสอบ..." : (loginMode === 'TU' ? "เข้าสู่ระบบด้วย TU-Account" : "เข้าสู่ระบบ (Log-in)")}
          </button>
        </form>

        {/* 🟢 ลิงก์ไปหน้าสมัครสมาชิก (โผล่เฉพาะตอนเลือกบุคคลทั่วไป) */}
        {loginMode === "GENERAL" && (
          <p className="text-center mt-6 text-sm font-bold text-gray-500">
            ยังไม่มีบัญชีใช่หรือไม่? <Link href="/register" className="text-[#1E0B99] hover:underline italic">สมัครสมาชิกที่นี่</Link>
          </p>
        )}

        {alert && <div className="mt-6 p-4 rounded-xl text-sm font-bold text-center bg-red-50 text-red-700 border border-red-200"><p>{alert.message}</p></div>}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-[#1E0B99] mb-4 italic uppercase">ตั้งค่าหลักสูตรของคุณ 🎯</h2>
            <p className="text-sm font-bold text-gray-500 mb-8">เนื่องจากบัญชีของคุณยังไม่ได้ระบุหลักสูตรอ้างอิง กรุณาเลือกหลักสูตรเพื่อใช้ในการวางแผนการเรียนครับ</p>
            
            <div className="mb-8 relative">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">เลือกหลักสูตร</label>
              <div 
                onClick={() => setIsCurrOpen(!isCurrOpen)}
                className="w-full mt-2 bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl outline-none font-bold text-[#1E0B99] cursor-pointer flex justify-between items-center"
              >
                <span className="truncate pr-2">{curriculums.find(c => c.id === selectedCurrId)?.name || "คลิกเพื่อเลือกหลักสูตร..."}</span>
                <span>▼</span>
              </div>

              {isCurrOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl z-[210] overflow-hidden">
                  <div className="p-3 border-b-2 border-gray-50">
                    <input type="text" placeholder="พิมพ์เพื่อค้นหาหลักสูตร..." className="w-full bg-gray-50 p-2.5 rounded-xl text-sm font-bold outline-none" value={currSearch} onChange={(e) => setCurrSearch(e.target.value)} />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {curriculums.filter(c => c.name.toLowerCase().includes(currSearch.toLowerCase())).map(c => (
                      <div key={c.id} onClick={() => { setSelectedCurrId(c.id); setIsCurrOpen(false); }} className="p-4 text-sm font-bold text-gray-700 hover:bg-[#1E0B99] hover:text-white cursor-pointer transition-colors flex justify-between">
                        <span>{c.name}</span>
                        <span className="opacity-50">ปี {c.academic_year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleConfirmCurriculum} disabled={isLoading || !selectedCurrId} className="w-full py-4 bg-green-500 text-white font-black rounded-2xl shadow-lg hover:bg-green-600 transition-all uppercase tracking-widest disabled:bg-gray-300">
              {isLoading ? "กำลังบันทึก..." : "ยืนยันและเริ่มใช้งาน ✔"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
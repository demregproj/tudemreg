"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPDPA, setShowPDPA] = useState(true);
  const [alert, setAlert] = useState<{type: string, title: string, message: string} | null>(null);
  
  // 🟢 ประกาศ State ให้ครบทุกฟิลด์
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    faculty: "",
    studentId: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 🟢 สมัครสมาชิกผ่าน Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          faculty: formData.faculty,
          student_id: formData.studentId
        },
      },
    });

    if (error) {
      setAlert({ type: 'error', title: 'สมัครสมาชิกไม่สำเร็จ', message: error.message });
    } else {
      setAlert({ 
        type: 'success', 
        title: 'ส่งอีเมลยืนยันแล้ว!', 
        message: 'กรุณาตรวจสอบ Inbox ในอีเมลของคุณเพื่อกดลิงก์ยืนยันตัวตนก่อนเข้าใช้งานครับ' 
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {/* PDPA Modal */}
      {showPDPA && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 animate-in fade-in zoom-in">
            <h2 className="text-2xl font-black text-center mb-6">ข้อตกลงการใช้งาน & PDPA</h2>
            <div className="bg-gray-50 p-6 rounded-2xl text-sm font-bold text-gray-600 mb-8 max-h-60 overflow-y-auto">
              <p>เราจัดเก็บข้อมูลอีเมล ชื่อ และคณะ เพื่อใช้ในการบริหารจัดการแผนการเรียนส่วนบุคคลของคุณเท่านั้น ข้อมูลทั้งหมดจะถูกเก็บเป็นความลับในระบบของ Supabase...</p>
            </div>
            <button onClick={() => setShowPDPA(false)} className="w-full py-4 bg-[#1E0B99] text-white font-black rounded-2xl uppercase text-sm">ยอมรับและเริ่มใช้งาน</button>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border-2 border-gray-100">
        <h1 className="text-4xl font-black italic text-center mb-8 text-[#1E0B99]">REGISTER</h1>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">อีเมล (สำหรับยืนยันตัวตน) *</label>
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" placeholder="yourname@example.com" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">รหัสผ่าน *</label>
              <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">รหัสนักศึกษา *</label>
              <input required type="text" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" placeholder="6XXXXXxxxx" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">ชื่อ-นามสกุล *</label>
              <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" placeholder="สมชาย ใจดี" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">คณะ *</label>
              <input required type="text" value={formData.faculty} onChange={(e) => setFormData({...formData, faculty: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" placeholder="คณะพยาบาลศาสตร์" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#1E0B99] text-white font-black text-lg rounded-2xl shadow-lg mt-6 hover:-translate-y-1 transition-all disabled:bg-gray-400">
            {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        {alert && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-bold text-center ${alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <p className="font-black mb-1">{alert.title}</p>
            <p>{alert.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
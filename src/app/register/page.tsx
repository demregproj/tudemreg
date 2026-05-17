"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPDPA, setShowPDPA] = useState(true);
  const [alert, setAlert] = useState<{type: string, title: string, message: string} | null>(null);
  
  // 🟢 1. ย้าย formData ขึ้นมาประกาศไว้ตรงนี้ก่อนเลยครับ!
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    entryYear: "", 
    faculty: "",
    department: ""
  });

  // 🟢 2. จากนั้นค่อยตามด้วยข้อมูล Course และ useMemo ต่างๆ
  const [courseData, setCourseData] = useState<{faculty: string, department: string}[]>([]);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data } = await supabase.from("master_courses").select("faculty, department").limit(50000);
      if (data) setCourseData(data as any);
    };
    fetchOrgs();
  }, []);

  const uniqueFaculties = useMemo(() => {
    const facs = new Set(courseData.map(c => c.faculty).filter(f => f && f !== "-"));
    return Array.from(facs).sort();
  }, [courseData]);

  const availableDepartments = useMemo(() => {
    if (!formData.faculty) return [];
    // ตอนนี้เรียกใช้ formData.faculty ได้อย่างปลอดภัยแล้วครับ
    const deps = new Set(courseData.filter(c => c.faculty === formData.faculty).map(c => c.department).filter(d => d && d !== "-"));
    return Array.from(deps).sort();
  }, [courseData, formData.faculty]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // จำลองรหัสนักศึกษา (ถ้าระบุปีมา ให้เติม 0 ไปด้านหลัง เผื่อระบบอื่นต้องการใช้)
    const mockStudentId = formData.entryYear ? `${formData.entryYear}00000000` : "";

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          faculty: formData.faculty,
          department: formData.department, // บันทึกภาควิชาด้วย
          student_id: mockStudentId,
          entry_year: formData.entryYear
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
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">ชื่อ-นามสกุล *</label>
              <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" placeholder="สมชาย ใจดี" />
            </div>
            
            {/* 🟢 รหัสชั้นปี (ไม่บังคับ) */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">รหัสชั้นปี (เช่น 66) - ไม่บังคับ</label>
              <input 
                type="text" 
                maxLength={2}
                value={formData.entryYear} 
                onChange={(e) => setFormData({...formData, entryYear: e.target.value.replace(/\D/g, '')})} 
                className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" 
                placeholder="เว้นว่างได้" 
              />
            </div>

            {/* 🟢 คณะ (Addable Dropdown) */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">คณะ</label>
              <input 
                list="faculty-list"
                value={formData.faculty} 
                onChange={(e) => setFormData({...formData, faculty: e.target.value, department: ""})} 
                className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" 
                placeholder="เลือกหรือพิมพ์ชื่อคณะ..." 
              />
              <datalist id="faculty-list">
                {uniqueFaculties.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>

            {/* 🟢 สาขา / ภาควิชา (Addable Dropdown) */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">สาขา / ภาควิชา</label>
              <input 
                list="department-list"
                value={formData.department} 
                onChange={(e) => setFormData({...formData, department: e.target.value})} 
                className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99]" 
                placeholder="เลือกหรือพิมพ์ชื่อสาขา..." 
              />
              <datalist id="department-list">
                {availableDepartments.map(d => <option key={d} value={d} />)}
              </datalist>
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
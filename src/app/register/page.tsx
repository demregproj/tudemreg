"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPDPA, setShowPDPA] = useState(true);
  
  const [curriculumsList, setCurriculumsList] = useState<any[]>([]);
  const [isCurrOpen, setIsCurrOpen] = useState(false);
  const [currSearch, setCurrSearch] = useState("");
  
  const [formData, setFormData] = useState({
    studentId: "",
    username: "",
    password: "",
    faculty: "",
    department: "",
    curriculumId: ""
  });

  useEffect(() => {
    async function fetchCurriculums() {
      const { data, error } = await supabase
        .from("curriculums")
        .select("id, name")
        .order('name', { ascending: true });
      
      if (data && !error) {
        setCurriculumsList(data);
      }
    }
    fetchCurriculums();
  }, []);

  const filteredCurriculums = useMemo(() => {
    return curriculumsList.filter(c => 
      c.name.toLowerCase().includes(currSearch.toLowerCase())
    );
  }, [curriculumsList, currSearch]);

  const selectedCurriculumName = curriculumsList.find(c => c.id === formData.curriculumId)?.name || "-- ไม่ระบุ / อื่นๆ --";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('student_id')
        .eq('student_id', formData.studentId)
        .single();

      if (existingUser) throw new Error("มีรหัสนักศึกษานี้อยู่ในระบบแล้ว");

      const newUserId = crypto.randomUUID();
      const { error } = await supabase.from("profiles").insert({
        id: newUserId,
        student_id: formData.studentId,
        full_name: formData.username,
        password: formData.password,
        faculty: formData.faculty || "ไม่ระบุ",
        department: formData.department || "ไม่ระบุ",
        curriculum_id: formData.curriculumId || null
      });

      if (error) throw error;

      alert("🎉 ลงทะเบียนสำเร็จ! กำลังพาคุณไปหน้าล็อกอิน");
      router.push("/login");
    } catch (error: any) {
      alert("❌ " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {/* 📜 PDPA Modal - อัปเดตข้อความใหม่ตามที่คุณต้องการ */}
      {showPDPA && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🛡️</div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">ข้อตกลงการใช้งาน & PDPA</h2>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm font-bold text-gray-600 leading-relaxed max-h-80 overflow-y-auto mb-8 scrollbar-hide">
              <p className="mb-4 text-[#1E0B99] text-base">ยินดีต้อนรับสู่ REGPLANing ✔</p>
              <ul className="space-y-4 list-disc pl-4">
                <li>เว็บนี้เป็นโปรเจ็กต์ที่พัฒนาขึ้นโดยนักศึกษา มธ. ธรรมดาคนหนึ่งที่มีความสนใจอยากสร้างเครื่องมือช่วยเพื่อนๆ วางแผนการเรียน</li>
                <li>ระบบนี้เป็นเพียงเครื่องมือวางแผนแบบ Informal **ไม่สามารถใช้อ้างอิงอย่างเป็นทางการได้** และไม่มีส่วนเกี่ยวข้องใดๆ กับระบบหลักของมหาวิทยาลัย</li>
                <li>ข้อมูลของคุณจะถูกจัดการตามหลัก PDPA โดยรหัสนักศึกษาและรหัสผ่านจะถูกนำไปใช้เพื่อการบริหารจัดการและบันทึกแผนการเรียนบนฐานข้อมูลของระบบนี้เท่านั้น</li>
                <li>ข้อมูลทั้งหมดจะถูกเก็บเป็นความลับอย่างดี ไม่มีการนำไปเผยแพร่ต่อ หรือใช้ในวัตถุประสงค์อื่นนอกเหนือจากการใช้งานภายในเว็บนี้</li>
              </ul>
            </div>

            <button 
              onClick={() => setShowPDPA(false)}
              className="w-full py-4 bg-[#1E0B99] text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg uppercase tracking-widest text-sm"
            >
              รับทราบและยอมรับ
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-2 border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2 text-[#1E0B99]">REGISTER</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">สร้างบัญชี REGPLANing ✔ ใหม่</p>
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
             <div className="h-px bg-gray-100 w-full my-2 relative">
                <span className="absolute left-0 -top-2.5 bg-white pr-3 text-[10px] font-black text-gray-300 uppercase italic">Required Info</span>
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">รหัสนักศึกษา *</label>
            <input required type="text" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99] transition-all text-sm" placeholder="6XXXXXxxxx" />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Username / ชื่อเล่น *</label>
            <input required type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99] transition-all text-sm" placeholder="username" />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Password *</label>
  <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-[#1E0B99] transition-all text-sm" placeholder="••••••••" />
            {/* ข้อความเตือนความปลอดภัย */}
            <p className="mt-2 text-[10px] font-bold text-red-400 italic ml-1">
            * เพื่อความปลอดภัย โปรดเลี่ยงการใช้รหัสผ่านเดียวกับ reg.tu.ac.th หรือระบบอื่นๆ ของมหาวิทยาลัย และควรมีความยาวอย่างน้อย 8 ตัวอักษร
            </p>
          </div>

          <div className="md:col-span-2 mt-4">
             <div className="h-px bg-gray-100 w-full my-2 relative">
                <span className="absolute left-0 -top-2.5 bg-white pr-3 text-[10px] font-black text-gray-300 uppercase italic">Optional Info</span>
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">คณะ</label>
            <input type="text" value={formData.faculty} onChange={(e) => setFormData({...formData, faculty: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-gray-300 transition-all text-sm" placeholder="เช่น พาณิชยศาสตร์ฯ" />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">สาขา / ภาควิชา</label>
            <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl outline-none font-bold focus:border-gray-300 transition-all text-sm" placeholder="เช่น การบัญชี" />
          </div>

          <div className="md:col-span-2 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">หลักสูตรอ้างอิง</label>
            
            <div 
              onClick={() => setIsCurrOpen(!isCurrOpen)}
              className="w-full mt-1.5 bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl font-bold text-sm cursor-pointer flex justify-between items-center hover:border-gray-200 transition-all"
            >
              <span className={formData.curriculumId ? "text-gray-900" : "text-gray-400"}>
                {selectedCurriculumName}
              </span>
              <span className={`transition-transform duration-200 ${isCurrOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {isCurrOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-50">
                  <input 
                    type="text"
                    placeholder="พิมพ์ค้นหาหลักสูตร..."
                    className="w-full bg-gray-50 border-2 border-gray-100 p-2.5 rounded-xl outline-none font-bold text-sm focus:border-[#1E0B99] transition-all"
                    value={currSearch}
                    onChange={(e) => setCurrSearch(e.target.value)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto scrollbar-hide">
                  <div 
                    onClick={() => { setFormData({...formData, curriculumId: ""}); setIsCurrOpen(false); setCurrSearch(""); }}
                    className="p-4 text-sm font-bold text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    -- ไม่ระบุ / อื่นๆ --
                  </div>
                  {filteredCurriculums.map((curriculum) => (
                    <div 
                      key={curriculum.id}
                      onClick={() => { 
                        setFormData({...formData, curriculumId: curriculum.id}); 
                        setIsCurrOpen(false); 
                        setCurrSearch(""); 
                      }}
                      className={`p-4 text-sm font-bold cursor-pointer transition-colors hover:bg-[#1E0B99] hover:text-white ${formData.curriculumId === curriculum.id ? 'bg-blue-50 text-[#1E0B99]' : 'text-gray-700'}`}
                    >
                      {curriculum.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="md:col-span-2 py-4 bg-[#1E0B99] text-white font-black text-lg rounded-2xl shadow-lg hover:-translate-y-1 transition-all mt-6 disabled:bg-gray-400"
          >
            {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => router.push("/login")} className="text-sm font-bold text-gray-400 hover:text-[#1E0B99] transition-colors underline decoration-2 underline-offset-4">
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
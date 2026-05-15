"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // เช็กสถานะตอนโหลดหน้าแรก
    const savedUser = localStorage.getItem("regplan_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleGuest = () => {
    // ถ้าเลือก Guest พาไปหน้าจัดตารางเลย
    router.push("/timetable");
  };

  return (
    <div className="bg-white font-sans text-gray-900 w-full">
      
      {/* --- 1. Hero Section (Slide) --- */}
      <header 
        className="relative min-h-[85vh] flex items-center justify-center text-center px-6 overflow-hidden" 
        style={{ backgroundImage: "url('/vr2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        <div className="relative z-10 max-w-5xl mt-8">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter italic uppercase leading-tight">
            REG<span className="text-[#FBBF24]">PLAN</span>ing <span className="text-green-500">✔</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 font-bold mb-12 max-w-3xl mx-auto leading-relaxed">
            เว็บไซต์ช่วยจัดตารางเรียนและวางแผนการศึกษาตลอดหลักสูตร <br/>
            ออกแบบมาเพื่อนักศึกษามธ.โดยเฉพาะ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {!user ? (
              // 🔴 กรณี: ยังไม่เข้าสู่ระบบ (เห็นปุ่ม Login / Guest ชัดเจน)
              <>
                <Link href="/login" className="bg-[#1E0B99] text-white px-10 py-5 rounded-2xl font-black text-xl hover:-translate-y-1 transition-all shadow-xl shadow-blue-900/50 border-2 border-[#1E0B99]">
                  เข้าสู่ระบบ (Log-in)
                </Link>
                <button onClick={handleGuest} className="bg-white/10 backdrop-blur-md text-white border-2 border-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-white hover:text-[#1E0B99] transition-all shadow-xl">
                  เข้าใช้งาน Guest Mode
                </button>
              </>
            ) : (
              // 🟢 กรณี: เข้าสู่ระบบแล้ว (เปลี่ยนปุ่มเป็นทางลัดเข้าฟีเจอร์)
              <>
                <Link href="/timetable" className="bg-[#1E0B99] text-white px-10 py-5 rounded-2xl font-black text-xl hover:-translate-y-1 transition-all shadow-xl shadow-blue-900/50 border-2 border-[#1E0B99]">
                  📅 ไปจัดตารางเรียน
                </Link>
                <Link href="/plan" className="bg-white/10 backdrop-blur-md text-white border-2 border-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-white hover:text-[#1E0B99] transition-all shadow-xl">
                  🎯 ไปวางแผนการเรียน
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- 2. Function Cards --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/timetable" className="group text-left bg-gray-50 p-12 rounded-[3.5rem] border-2 border-transparent hover:border-[#1E0B99] hover:bg-white transition-all shadow-sm hover:shadow-2xl">
            <div className="text-5xl mb-8">📅</div>
            <h4 className="text-4xl font-black mb-4 group-hover:text-[#1E0B99] italic uppercase tracking-tighter">จัดตารางเรียน</h4>
            <p className="font-bold text-gray-500 leading-relaxed text-lg">ทดลองจัดตารางเรียนรายเทอม ตรวจสอบเวลาเรียนซ้อน และเช็กวันสอบไม่ใช้ชนกัน</p>
          </Link>
          <Link href="/plan" className="group text-left bg-gray-50 p-12 rounded-[3.5rem] border-2 border-transparent hover:border-[#1E0B99] hover:bg-white transition-all shadow-sm hover:shadow-2xl">
            <div className="text-5xl mb-8">🎯</div>
            <h4 className="text-4xl font-black mb-4 group-hover:text-[#1E0B99] italic uppercase tracking-tighter">วางแผนการเรียน</h4>
            <p className="font-bold text-gray-500 leading-relaxed text-lg">วางแผนวิชาที่ต้องเรียนตามโครงสร้างหลักสูตร และติดตามหน่วยกิตสะสม</p>
          </Link>
        </div>
      </section>

      {/* --- 3. Description Section --- */}
      <section className="py-24 bg-gray-50 px-6 w-full">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-black mb-12 text-center uppercase italic border-b-4 border-[#FBBF24] inline-block">วิธีใช้งานเบื้องต้น</h3>
          <div className="space-y-12 mt-12">
            <div className="flex gap-8 items-start">
              <span className="text-5xl font-black text-[#1E0B99] opacity-20 italic">01</span>
              <div>
                <h5 className="text-2xl font-black mb-3 uppercase tracking-tight">ค้นหาและเพิ่มรายวิชา</h5>
                <p className="font-bold text-gray-500 text-lg">ค้นหาวิชาจากรหัสหรือชื่อวิชา ระบบจะดึงข้อมูลวันเวลาเรียนและวันสอบที่อัปเดตล่าสุดมาให้ทันที</p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <span className="text-5xl font-black text-[#1E0B99] opacity-20 italic">02</span>
              <div>
                <h5 className="text-2xl font-black mb-3 uppercase tracking-tight">จัดการด้วยการลาก - วาง (drag and drop)</h5>
                <p className="font-bold text-gray-500 text-lg">ลากและวางวิชาลงในแผนการเรียนแต่ละเทอมได้อย่างอิสระ ระบบจะคำนวณหน่วยกิตให้อัตโนมัติ</p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <span className="text-5xl font-black text-[#1E0B99] opacity-20 italic">03</span>
              <div>
                <h5 className="text-2xl font-black mb-3 uppercase tracking-tight">บันทึกและแชร์กับเพื่อน</h5>
                <p className="font-bold text-gray-500 text-lg">สามารถนำภาพแผนการเรียนที่สร้างขึ้นมาแชร์กับเพื่อนๆ หรือปรึกษาคณะเพื่อประกอบการยื่นคำร้อง</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. Q&A Section --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full flex-grow">
        <h3 className="text-3xl font-black mb-12 text-center uppercase italic">คำถามที่พบบ่อย (Q&A)</h3>
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h6 className="font-black text-[#1E0B99] text-xl mb-3 italic">Q: ข้อมูลวิชาอัปเดตแค่ไหน?</h6>
            <p className="font-bold text-gray-500">A: ข้อมูลจะถูกดึงมาจากประกาศของมหาวิทยาลัยและอัปเดตอย่างต่อเนื่องผ่านระบบผู้ดู (ไม่ใช่การอัพเดตเรียลไทม์)</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h6 className="font-black text-[#1E0B99] text-xl mb-3 italic">Q: จำเป็นต้องสมัครสมาชิกหรือไม่?</h6>
            <p className="font-bold text-gray-500">A: สามารถใช้งานได้ทันทีผ่าน Guest Mode แต่ข้อมูลจะไม่ถูกบันทึก หากต้องการบันทึกข้อมูลต้องทำการสมัครสมาชิก</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h6 className="font-black text-[#1E0B99] text-xl mb-3 italic">Q: ข้อมูลบัญชีเชื่อมกับระบบของมหาวิทยาลัยไหม?</h6>
            <p className="font-bold text-gray-500">A: ข้อมูลไม่ได้เชื่อมต่อกับระบบของมหาวิทยาลัย ผู้ใช้จะต้องสร้างบัญชีเองโดยที่ไม่มีการดึงข้อมูลจากระบบของมหาวิทยาลัย</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h6 className="font-black text-[#1E0B99] text-xl mb-3 italic">Q: ข้อมูลรหัสนักศึกษาจะถูกเก็บหรือไม่?</h6>
            <p className="font-bold text-gray-500">A: ข้อมูลรหัสนักศึกษาจะถูกเก็บในฐานข้อมูลเพื่อใช้ในการเรียกดูแผนการเรียนส่วนบุคคลของคุณเท่านั้น และจะไม่ถูกเผยแพร่หรือใช้งานอื่นใด ทั้งนี้เราแนะนำให้ใช้รหัสผ่านเป็นคนละชุดกับ reg tu</p>
          </div>
        </div>
      </section>

      {/* --- 5. PDPA & Footer --- */}
      <footer className="bg-gray-900 text-white py-20 px-6 w-full mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <h4 className="text-xl font-black mb-8 uppercase border-l-4 border-[#FBBF24] pl-4 italic">นโยบายความเป็นส่วนตัว (PDPA)</h4>
              <p className="text-sm text-gray-400 font-bold leading-relaxed">
                เราจัดเก็บรหัสนักศึกษาและชื่อเพื่อใช้ในการเรียกดูแผนการเรียนส่วนบุคคลของคุณเท่านั้น ข้อมูลทั้งหมดจะถูกเก็บเป็นความลับในฐานข้อมูลที่ปลอดภัย 
                และจะไม่มีการนำไปเผยแพร่หรือใช้งานเพื่อวัตถุประสงค์อื่นแต่อย่างใด หากคุณมีคำถามหรือข้อกังวลเกี่ยวกับข้อมูลส่วนบุคคลของคุณ สามารถติดต่อกับผู้พัฒนาเพื่อจัดการข้อมูล
              </p>
            </div>
            <div className="md:text-right">
              <h4 className="text-xl font-black mb-8 uppercase border-r-4 border-[#FBBF24] pr-4 italic text-white">ติดต่อผู้พัฒนา</h4>
              <p className="text-sm text-gray-400 font-bold mb-3 italic">พบปัญหาการใช้งานหรือข้อเสนอแนะ ติดต่อเราได้ที่:</p>
              <a href="mailto:demreg.proj@gmail.com" className="text-[#FBBF24] font-black text-2xl hover:underline tracking-tight">demreg.proj@gmail.com</a>
            </div>
          </div>
          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">© 2026 REGPLANing (DEMREG Project). Created by a TU Student for TU Students.</p>
        </div>
      </footer>
    </div>
  );
}
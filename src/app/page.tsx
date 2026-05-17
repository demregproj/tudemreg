"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // 🟢 State สำหรับเปิดปิดกล่อง FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    // เช็กสถานะตอนโหลดหน้าแรก
    const savedUser = localStorage.getItem("regplan_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleGuest = () => {
    // ถ้าเลือก Guest พาไปหน้าจัดตารางเลย
    router.push("/timetable");
  };

  // 🟢 ฟังก์ชันสลับการเปิด/ปิด FAQ
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // 🟢 ข้อมูลคำถาม-คำตอบทั้งหมดของคุณปภาวินท์
  const faqs = [
    {
      question: "ข้อมูลวิชาอัปเดตแค่ไหน?",
      answer: "ข้อมูลจะถูกดึงมาจากประกาศของมหาวิทยาลัยและอัปเดตอย่างต่อเนื่องโดยแอดมิน (ไม่ใช่การอัพเดตเรียลไทม์) ทั้งนี้แนะนำให้ตรวจสอบความถูกต้องของข้อมูลอีกครั้งก่อนนำไปใช้อ้างอิงจริง"
    },
    {
      question: "ยังต้องลงทะเบียนเรียนผ่าน reg tu หรือไม่?",
      answer: "จำเป็น! เว็บไซต์ของเราเป็นเพียงเครื่องมือในการวางแผนการเรียน และไม่สามารถแทนที่การลงทะเบียนเรียนในระบบ reg tu"
    },
    {
      question: "ยังต้องขอโควตาหรือไม่?",
      answer: "จำเป็น! เว็บไซต์ของเราเป็นเพียงเครื่องมือในการวางแผนการเรียน ไม่มีการยื่นคำร้องขอโควตา โดยผู้ใช้ต้องดำเนินการขอโควตาผ่านคณะต่างๆ ด้วยตนเอง"
    },
    {
      question: "จำเป็นต้องสมัครสมาชิกหรือไม่?",
      answer: "สามารถใช้งานได้ทันทีผ่าน Guest Mode แต่ข้อมูลจะไม่ถูกบันทึก หากต้องการบันทึกข้อมูลต้องทำการเข้าสู่ระบบ โดยหากเป็นนักศึกษามธ. สามารถเข้าใช้งานได้ทันทีผ่าน TU-Account"
    },
    {
      question: "ข้อมูลบัญชีเชื่อมกับระบบของมหาวิทยาลัยไหม?",
      answer: "ข้อมูลไม่ได้เชื่อมต่อกับระบบของมหาวิทยาลัยโดยตรง การ login ด้วย TU-Account เป็นเพียงการยืนยันตัวตนผ่านระบบ API ของมหาวิทยาลัยเท่านั้น ไม่มีการเก็บข้อมูลส่วนตัวของผู้ใช้"
    },
    {
      question: "ข้อมูล TU-Account หรือรหัสผ่านจะถูกเก็บหรือไม่?",
      answer: "การเข้าสู่ระบบผ่าน TU-Account ข้อมูลรหัสนักศึกษาจะไม่ถูกเก็บในฐานข้อมูลของเรา การ login ด้วย TU-Account เป็นเพียงการยืนยันตัวตนผ่าน API ของมหาวิทยาลัยเท่านั้น ผู้พัฒนาจะไม่ได้รับข้อมูลส่วนตัวของผู้ใช้โดยตรงรวมถึงรหัสผ่าน TU-Account เช่นกัน"
    },
    {
      question: "เว็บไซต์นี้เป็นเว็บไซต์ทางการหรือไม่?",
      answer: "ไม่ใช่! เว็บไซต์นี้เป็นเว็บไซต์ที่พัฒนาโดยนักศึกษาเพื่อประโยชน์ในการช่วยวางแผนการเรียนเท่านั้น ไม่ใช่เว็บไซต์ทางการของมหาวิทยาลัยและไม่มีส่วนเกี่ยวข้องกับมหาวิทยาลัย"
    },
    {
      question: "ข้อมูลบนเว็บไซต์น่าเชื่อถือหรือไม่?",
      answer: "เว็บไซต์ของเราเป็นเพียงเครื่องมือในการวางแผนการเรียนโดยอ้างอิงจากข้อมูลประกาศของมหาวิทยาลัย อย่างไรก็ตาม ผู้ใช้ควรตรวจสอบข้อมูลให้แน่ใจก่อนนำไปใช้ และผู้พัฒนาไม่มีส่วนรับผิดชอบต่อความถูกต้องของข้อมูลกรณีที่ผู้ใช้นำไปใช้โดยไม่ตรวจสอบอีกครั้ง"
    },
    {
      question: "ผู้พัฒนาเว็บไซต์นี้คือใคร และติดต่อได้อย่างไร?",
      answer: "เราคือกลุ่มนักศึกษาที่พัฒนาเว็บไซต์นี้ขึ้นมาเพื่อประโยชน์ในการใช้งานของนักศึกษาทุกคน สามารถติดต่อเราได้ที่ demreg.proj@gmail.com"
    }
  ];

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
            <span className="text-xl font-black mb-12 text-center uppercase italic">เพื่อเพื่อนนักศึกษาธรรมศาสตร์</span>
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

      {/* --- 4. Q&A Section (เปลี่ยนเป็นแบบ Accordion พับเก็บได้) --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full flex-grow">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-black mb-2 uppercase italic text-[#1E0B99]">คำถามที่พบบ่อย (Q&A)</h3>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            ข้อควรทราบก่อนการใช้งานระบบ
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                openFaqIndex === index ? "border-[#1E0B99] bg-blue-50/30 shadow-md" : "border-gray-100 bg-white hover:border-gray-300"
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 outline-none"
              >
                <h4 className={`text-base md:text-lg font-black transition-colors ${openFaqIndex === index ? "text-[#1E0B99]" : "text-gray-900"}`}>
                  <span className="text-[#1E0B99] italic mr-2">Q:</span>{faq.question}
                </h4>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  openFaqIndex === index ? "bg-[#1E0B99] text-white rotate-180" : "bg-gray-100 text-gray-400"
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {/* ส่วนเนื้อหาคำตอบที่จะ Slide down */}
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openFaqIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-0 text-sm md:text-base font-bold text-gray-600 leading-relaxed">
                  <div className="w-full h-[2px] bg-gray-100 mb-4"></div>
                  <span className="text-green-600 font-black italic mr-2">A:</span>{faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 5. PDPA & Footer --- */}
      <footer className="bg-gray-900 text-white py-20 px-6 w-full mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <h4 className="text-xl font-black mb-8 uppercase border-l-4 border-[#FBBF24] pl-4 italic">นโยบายความเป็นส่วนตัว (PDPA)</h4>
              
              <div className="text-sm text-gray-400 font-bold leading-relaxed">
                <p className="mb-4">
                  เราให้ความสำคัญกับการปกป้องข้อมูลส่วนบุคคลของคุณ ข้อมูลที่จัดเก็บจะถูกใช้เพื่อการบริหารจัดการแผนการเรียนส่วนบุคคลของคุณเท่านั้น
                </p>
                <Link href="/pdpa" className="text-[#FBBF24] hover:text-white transition-colors inline-flex items-center gap-1.5 underline underline-offset-4">
                  อ่านนโยบายความเป็นส่วนตัวฉบับเต็ม
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

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
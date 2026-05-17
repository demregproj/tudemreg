"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Timetable, { getCourseTheme } from "./Timetable";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";

const timeToMins = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const isOverlap = (s1: string, e1: string, s2: string, e2: string) => {
  if (!s1 || !e1 || !s2 || !e2) return false;
  const start1 = timeToMins(s1);
  const end1 = timeToMins(e1);
  const start2 = timeToMins(s2);
  const end2 = timeToMins(e2);
  return start1 < end2 && end1 > start2;
};

export default function CourseManager({ allCourses }: { allCourses: any[] }) {
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCourseCode, setViewingCourseCode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); 

  const timetableRef = useRef<HTMLDivElement>(null);

  const [pendingAdd, setPendingAdd] = useState<any[] | null>(null);
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    type: "info" | "error" | "warning" | "success";
    title: string;
    messages: string[];
  } | null>(null);

  const getUserId = () => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("regplan_user");
      return savedUser ? JSON.parse(savedUser).id : null;
    }
    return null;
  };

  useEffect(() => {
    const loadSavedSchedule = async () => {
      const userId = getUserId();
      if (!userId || !allCourses || allCourses.length === 0) return;
      
      const { data, error } = await supabase
        .from("registrations")
        .select("section_id")
        .eq("user_id", userId);

      if (data && !error) {
        const savedSectionIds = data.map((d: any) => d.section_id);
        const savedCourses = allCourses.filter(c => savedSectionIds.includes(c.id));
        setSelectedCourses(savedCourses);
      }
    };
    loadSavedSchedule();
  }, [allCourses]);
  
  const uniqueSubjects = useMemo(() => {
    if (!allCourses) return [];
    const term = searchTerm.toLowerCase();
    const filtered = allCourses.filter(c => 
      c.course_code?.toLowerCase().includes(term) || 
      c.course_name?.toLowerCase().includes(term)
    );
    const seen = new Set();
    return filtered.filter(c => {
      const duplicate = seen.has(c.course_code);
      seen.add(c.course_code);
      return !duplicate;
    }).slice(0, 30);
  }, [searchTerm, allCourses]);

  const sectionsToDisplay = useMemo(() => {
    if (!viewingCourseCode || !allCourses) return [];
    return allCourses.filter(c => c.course_code === viewingCourseCode);
  }, [viewingCourseCode, allCourses]);

  const handleAddCourse = (course: any) => {
    if (!course || !allCourses) return;
    const secTarget = course.section || null;
    const allPeriodsOfNewCourse = allCourses.filter(
      c => c.course_code === course.course_code && c.section === secTarget
    );

    if (selectedCourses.some(c => c.course_code === course.course_code)) {
      setCustomAlert({
        isOpen: true,
        type: "info",
        title: "วิชานี้ถูกเลือกแล้ว",
        messages: [`คุณได้ลงทะเบียนวิชา ${course.course_code} ไว้ในตารางแล้วครับ`]
      });
      return;
    }

    let classConflicts: string[] = [];
    let midtermConflicts: string[] = [];
    let finalConflict: string | null = null;

    for (let newP of allPeriodsOfNewCourse) {
      for (let existP of selectedCourses) {
        if (newP.final_date && existP.final_date && newP.final_date === existP.final_date) {
          if (isOverlap(newP.final_time_start, newP.final_time_end, existP.final_time_start, existP.final_time_end)) {
            finalConflict = `วิชา ${newP.course_code} สอบ Final ชนกับ ${existP.course_code} (${newP.final_date})`;
          }
        }
        if (newP.class_day === existP.class_day) {
          if (isOverlap(newP.class_time_start, newP.class_time_end, existP.class_time_start, existP.class_time_end)) {
            classConflicts.push(`เวลาเรียนชนกับ ${existP.course_code} (วัน${newP.class_day})`);
          }
        }
        if (newP.midterm_date && existP.midterm_date && newP.midterm_date === existP.midterm_date) {
          if (isOverlap(newP.midterm_time_start, newP.midterm_time_end, existP.midterm_time_start, existP.midterm_time_end)) {
            midtermConflicts.push(`สอบ Midterm ชนกับ ${existP.course_code} (${newP.midterm_date})`);
          }
        }
      }
    }

    if (finalConflict) {
      setCustomAlert({ isOpen: true, type: "error", title: "ไม่สามารถลงทะเบียนได้!", messages: [finalConflict] });
      return;
    }

    if (classConflicts.length > 0 || midtermConflicts.length > 0) {
      setPendingAdd(allPeriodsOfNewCourse);
      setCustomAlert({ isOpen: true, type: "warning", title: "พบเวลาซ้อนทับกัน", messages: [...classConflicts, ...midtermConflicts] });
      return;
    }

    setSelectedCourses([...selectedCourses, ...allPeriodsOfNewCourse]);
    setIsSearchOpen(false);
  };

  const handleSaveTimetable = async () => {
    if (selectedCourses.length === 0) {
      setCustomAlert({ isOpen: true, type: "info", title: "ไม่พบข้อมูล", messages: ["กรุณาเลือกวิชาอย่างน้อย 1 วิชาเพื่อบันทึกตารางเรียนครับ"] });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setCustomAlert({ isOpen: true, type: "warning", title: "โหมดบุคคลทั่วไป (Guest)", messages: ["กรุณาล็อกอินเพื่อบันทึกตารางเรียนลงฐานข้อมูลครับ"] });
      return;
    }

    setIsSaving(true);
    try {
      const userId = getUserId();
      if (!userId) throw new Error("ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่อีกครั้ง");

      await supabase.from("registrations").delete().eq("user_id", userId);

      const uniqueSectionIds = Array.from(new Set(selectedCourses.map(c => c.id)));
      const insertData = uniqueSectionIds.map(sectionId => ({ user_id: userId, section_id: sectionId }));

      const { error } = await supabase.from("registrations").insert(insertData);
      if (error) throw error;

      setCustomAlert({ isOpen: true, type: "success", title: "บันทึกสำเร็จ!", messages: ["ตารางเรียนของคุณถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้วครับ"] });
    } catch (err: any) {
      setCustomAlert({ isOpen: true, type: "error", title: "เกิดข้อผิดพลาด", messages: [err.message || "ไม่สามารถบันทึกตารางเรียนได้ในขณะนี้"] });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportImage = async () => {
    if (!timetableRef.current) return;
    try {
      const canvas = await html2canvas(timetableRef.current, {
        scale: 2.5, 
        backgroundColor: "#F9FAFB", 
        useCORS: true, 
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `REGPLANing-Schedule-${new Date().getTime()}.png`;
      link.click();
      setCustomAlert({ isOpen: true, type: "success", title: "เซฟรูปสำเร็จ!", messages: ["ระบบได้บันทึกตารางเรียนเป็นรูปภาพลงในเครื่องของคุณแล้วครับ"] });
    } catch (err) {
      console.error("Export Failed:", err);
      setCustomAlert({ isOpen: true, type: "error", title: "เกิดข้อผิดพลาด", messages: ["ไม่สามารถบันทึกรูปภาพได้ครับ"] });
    }
  };

  const handleConfirmAdd = () => {
    if (pendingAdd) {
      setSelectedCourses([...selectedCourses, ...pendingAdd]);
      setPendingAdd(null);
      setIsSearchOpen(false);
    }
    setCustomAlert(null);
  };

  const handleCloseAlert = () => {
    setPendingAdd(null);
    setCustomAlert(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-gray-800 relative">
      {/* 🟢 Responsive Header & Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pb-4 border-b border-gray-200 gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight italic uppercase">จัดตารางเรียน</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportImage}
            className="w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 bg-[#1E0B99] text-white hover:bg-black hover:-translate-y-1"
          >
            📸 เซฟเป็นรูปภาพ
          </button>
          <button 
            onClick={handleSaveTimetable}
            disabled={isSaving}
            className={`w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex justify-center items-center gap-2 ${
              isSaving ? "bg-gray-100 text-gray-400" : "bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            }`}
          >
            {isSaving ? "SAVING..." : "💾 บันทึกตารางเรียน"}
          </button>
        </div>
      </div>

      <div ref={timetableRef} className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-gray-100 relative mb-8 md:mb-12 shadow-sm">
        <div className="flex justify-between items-end mb-6 px-2">
           <div>
             <h2 className="text-2xl md:text-3xl font-black text-gray-900 italic uppercase tracking-tighter">My Schedule</h2>
             <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">ตารางเรียนและวันสอบ</p>
           </div>
           <div className="text-right pb-1">
             <span className="text-[#1E0B99] font-black italic text-lg md:text-2xl tracking-tighter">REG<span className="text-gray-900">PLANing</span> <span className="text-green-500">✔</span></span>
           </div>
        </div>
        
        {/* เลื่อนเพื่อดูตารางในจอมือถือ (มีใน Timetable.tsx อยู่แล้ว) */}
        <p className="text-xs text-gray-400 font-bold mb-2 md:hidden text-center italic">← เลื่อนซ้าย-ขวาเพื่อดูตารางเรียนทั้งหมด →</p>
        <Timetable selectedCourses={selectedCourses} />
      </div>

      <div className="mt-8 md:mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            รายวิชาที่เลือก ({Array.from(new Set(selectedCourses.map(c => c.course_code))).length} วิชา)
          </h2>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="w-full sm:w-auto bg-[#1E0B99] text-white px-6 py-3 sm:py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md hover:-translate-y-1"
          >
            + เพิ่มรายวิชา
          </button>
        </div>

        <div className="space-y-4">
          {Array.from(new Set(selectedCourses.map(c => `${c.course_code}-${c.section || 'none'}`))).map(uniqueKey => {
            const [code, secId] = uniqueKey.split('-');
            const coursePeriods = selectedCourses.filter(c => c.course_code === code && (c.section === secId || (!c.section && secId === 'none')));
            const course = coursePeriods[0];
            if (!course) return null;
            const theme = getCourseTheme(code);
            
            return (
              <div key={uniqueKey} className="flex flex-col md:flex-row bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-4 md:p-6 md:w-48 flex items-center justify-center ${theme.bg} border-b md:border-b-0 md:border-r border-gray-100`}>
                  <span className={`text-2xl md:text-3xl font-black italic ${theme.text}`}>{code}</span>
                </div>
                <div className="flex-1 p-4 md:p-6 relative">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight">{course?.course_name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 mb-3">{course?.faculty} • {course?.department}</p>
                  <div className="mt-1 flex flex-wrap gap-2 md:gap-4 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                    <span>👨‍🏫 {course?.instructor || "ไม่ระบุ"}</span>
                    <span className="hidden sm:inline">|</span>
                    <span>📍 {course?.room || "ไม่ระบุ"}</span>
                  </div>
                  <div className="mt-4 flex gap-4 md:gap-6 text-sm text-gray-600">
                    <p>Section: <span className="font-semibold text-gray-900">{course?.section}</span></p>
                    <p>Credit: <span className="font-semibold text-gray-900">{course?.credits} CR.</span></p>
                  </div>
                </div>
                <div className="p-4 md:p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center relative bg-gray-50/50">
                  <button onClick={() => setSelectedCourses(selectedCourses.filter(c => c.course_code !== code))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors text-xs md:text-sm font-bold bg-white md:bg-transparent px-2 py-1 md:p-0 rounded shadow-sm md:shadow-none">✕ ลบ</button>
                  <div className="text-xs md:text-sm mt-4 md:mt-0">
                    <p className="font-semibold text-gray-900 mb-2 italic uppercase">ตารางเรียน</p>
                    {coursePeriods.map((p, i) => (
                      <p key={i} className="text-gray-600 font-medium">
                        {p.class_day} • {p.class_time_start?.slice(0,5)} - {p.class_time_end?.slice(0,5)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🟢 Responsive Search Modal (แก้พังบนมือถือ) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-5xl h-[95vh] md:h-[85vh] rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
            
            {/* ซ้าย: แถบค้นหา (มือถือจะอยู่ครึ่งบน) */}
            <div className="w-full md:w-1/3 h-[40%] md:h-full border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 flex flex-col">
              <div className="p-4 md:p-8 flex justify-between items-center md:block">
                <h3 className="text-xl md:text-2xl font-black italic md:mb-4 uppercase">Search Course</h3>
                <button onClick={() => setIsSearchOpen(false)} className="md:hidden text-gray-400 hover:text-red-500 font-black px-2">✕ ปิด</button>
              </div>
              <div className="px-4 md:px-8 pb-2 md:pb-4">
                <input 
                  type="text" 
                  placeholder="รหัส หรือ ชื่อวิชา..." 
                  className="w-full bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-3.5 text-sm font-bold outline-none focus:border-[#1E0B99] shadow-sm transition-all" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 space-y-1 scrollbar-hide">
                {uniqueSubjects.map(sub => (
                  <button 
                    key={sub.course_code} 
                    onClick={() => setViewingCourseCode(sub.course_code)} 
                    className={`w-full p-4 md:p-5 rounded-xl md:rounded-2xl text-left transition-all flex items-center justify-between ${
                      viewingCourseCode === sub.course_code ? "bg-[#1E0B99] text-white shadow-lg" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-black italic text-base md:text-lg">{sub.course_code}</p>
                      <p className={`text-[10px] md:text-xs font-bold truncate ${viewingCourseCode === sub.course_code ? "text-blue-100" : "text-gray-400"}`}>
                        {sub.course_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ขวา: รายละเอียด (มือถือจะอยู่ครึ่งล่าง) */}
            <div className="w-full md:w-2/3 h-[60%] md:h-full flex flex-col bg-white relative p-6 md:p-12 overflow-y-auto">
              <button onClick={() => setIsSearchOpen(false)} className="hidden md:block absolute top-8 right-8 text-gray-300 hover:text-black font-bold">✕</button>
              
              {viewingCourseCode ? (
                <div>
                  <div className="mb-6 md:mb-10">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-1 md:mb-2">{viewingCourseCode}</h2>
                    <p className="text-lg md:text-2xl text-gray-500 font-bold leading-tight">{sectionsToDisplay[0]?.course_name}</p>
                  </div>
                  <div className="space-y-4">
{Array.from(new Set(sectionsToDisplay.map(s => s.section))).map((secId, index) => {
  const sectionGroup = sectionsToDisplay.filter(s => s.section === secId);
  const firstEntry = sectionGroup[0];
  const isAdded = selectedCourses.some(c => c.course_code === viewingCourseCode && c.section === secId);
  return (
    <div 
      key={secId || `sec-${index}`} // 🟢 เติม || `sec-${index}` เป็นค่าสำรองกันเหนียว
      onClick={() => !isAdded && handleAddCourse(firstEntry)} 
// ...
                          className={`p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer ${
                            isAdded ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-100 hover:border-[#1E0B99] shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-4 md:mb-6">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black ${
                                isAdded ? "bg-[#1E0B99] text-white" : "bg-gray-100 text-transparent"
                              }`}>✓</div>
                              <span className={`font-black text-lg md:text-2xl italic ${!secId || secId === 'undefined' || secId === 'null' ? 'text-red-500' : ''}`}>
    {secId && secId !== 'undefined' && secId !== 'null' ? `SECTION ${secId}` : "❌ ไม่เปิดสอนในเทอมนี้"}
  </span>
</div>
                            <span className="text-xs md:text-sm font-black bg-gray-900 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full">{firstEntry.credits} CR.</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 text-xs md:text-sm font-bold bg-gray-50/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100">
  <div>
    <p className="text-[#1E0B99] uppercase italic mb-2 md:mb-3 tracking-widest">Schedule</p>
    {sectionGroup.map((p, i) => (
      <div key={i} className="mb-3 last:mb-0">
        <p className="text-gray-700">{p.class_day} {p.class_time_start?.slice(0,5)} - {p.class_time_end?.slice(0,5)}</p>
        {/* 🟢 เพิ่มชื่ออาจารย์ตรงนี้ครับ */}
        <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
          Instructor: {p.instructor || "ไม่ระบุ"}
        </p>
      </div>
    ))}
  </div>
  <div>
    <p className="text-red-500 uppercase italic mb-2 md:mb-3 tracking-widest mt-4 sm:mt-0">Exams</p>
    <p className="text-gray-500">MID: {firstEntry.midterm_date || '-'} ({firstEntry.midterm_time_start?.slice(0,5)})</p>
    <p className="text-gray-500">FIN: {firstEntry.final_date || '-'} ({firstEntry.final_time_start?.slice(0,5)})</p>
  </div>
</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-200 font-black text-2xl md:text-4xl italic text-center px-4">SELECT A COURSE</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {customAlert && customAlert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 md:p-10 text-center animate-in fade-in zoom-in duration-200">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full mb-6 ${
                customAlert.type === 'error' ? 'bg-red-100 text-red-500' :
                customAlert.type === 'warning' ? 'bg-orange-100 text-orange-500' :
                customAlert.type === 'success' ? 'bg-green-100 text-green-500' :
                'bg-blue-100 text-blue-500'
            }`}>
              {customAlert.type === 'error' && <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
              {customAlert.type === 'warning' && <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              {customAlert.type === 'success' && <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              {customAlert.type === 'info' && <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </div>

            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4">{customAlert.title}</h3>
            <div className="text-[11px] md:text-sm font-bold text-gray-500 space-y-2 mb-8 text-left bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 overflow-y-auto max-h-40">
              {customAlert.messages.map((msg, i) => (
                <p key={i} className="flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${customAlert.type === 'error' ? 'bg-red-400' : customAlert.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                  <span>{msg}</span>
                </p>
              ))}
              {customAlert.type === 'warning' && (
                <p className="mt-4 pt-4 border-t border-gray-200 text-center font-black text-gray-900 uppercase italic">Confirm registration?</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {customAlert.type === 'warning' ? (
                <>
                  <button onClick={handleCloseAlert} className="flex-1 py-3 md:py-4 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px] md:text-xs">Cancel</button>
                  <button onClick={handleConfirmAdd} className="flex-1 py-3 md:py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-orange-100">Confirm</button>
                </>
              ) : (
                <button onClick={handleCloseAlert} className={`w-full py-3 md:py-4 font-black rounded-xl text-white transition-all uppercase tracking-widest text-[10px] md:text-xs shadow-lg ${
                    customAlert.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 
                    customAlert.type === 'success' ? 'bg-green-500 hover:bg-green-600 shadow-green-100' :
                    'bg-[#1E0B99] hover:bg-black shadow-blue-100'
                }`}>
                  OKAY
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
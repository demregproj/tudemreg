"use client";

import React, { useState, useMemo } from "react";
import Timetable, { getCourseTheme } from "./Timetable";
import { supabase } from "@/lib/supabase";

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

  // --- State สำหรับ Custom Pop-up ---
  const [pendingAdd, setPendingAdd] = useState<any[] | null>(null);
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    type: "info" | "error" | "warning" | "success";
    title: string;
    messages: string[];
  } | null>(null);

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
      setCustomAlert({
        isOpen: true,
        type: "error",
        title: "ไม่สามารถลงทะเบียนได้!",
        messages: [finalConflict]
      });
      return;
    }

    if (classConflicts.length > 0 || midtermConflicts.length > 0) {
      setPendingAdd(allPeriodsOfNewCourse);
      setCustomAlert({
        isOpen: true,
        type: "warning",
        title: "พบเวลาซ้อนทับกัน",
        messages: [...classConflicts, ...midtermConflicts]
      });
      return;
    }

    setSelectedCourses([...selectedCourses, ...allPeriodsOfNewCourse]);
    setIsSearchOpen(false);
  };

  // --- ฟังก์ชันบันทึกตารางเรียนลง Supabase (อัปเดตตามโครงสร้างใหม่) ---
  const handleSaveTimetable = async () => {
    if (selectedCourses.length === 0) {
      setCustomAlert({
        isOpen: true,
        type: "info",
        title: "ไม่พบข้อมูล",
        messages: ["กรุณาเลือกวิชาอย่างน้อย 1 วิชาเพื่อบันทึกตารางเรียนครับ"]
      });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: เปลี่ยนเป็น User ID จริงเมื่อมีระบบ Login
      const dummyUserId = "00000000-0000-0000-0000-000000000000";

      // ลบข้อมูลตารางเรียนเดิมของเทอมนี้ทิ้งก่อนบันทึกใหม่
      await supabase.from("registrations").delete().eq("user_id", dummyUserId);

      // ดึง ID ของ Section จากตาราง term_sections ที่ผู้ใช้เลือก
      const uniqueSectionIds = Array.from(new Set(selectedCourses.map(c => c.id)));
      
      const insertData = uniqueSectionIds.map(sectionId => ({
        user_id: dummyUserId,
        section_id: sectionId // บันทึกเชื่อมโยงไปยัง term_sections
      }));

      const { error } = await supabase.from("registrations").insert(insertData);
      if (error) throw error;

      setCustomAlert({
        isOpen: true,
        type: "success",
        title: "บันทึกสำเร็จ!",
        messages: ["ตารางเรียนของคุณถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้วครับ"]
      });
    } catch (err) {
      console.error(err);
      setCustomAlert({
        isOpen: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        messages: ["ไม่สามารถบันทึกตารางเรียนได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"]
      });
    } finally {
      setIsSaving(false);
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
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">จัดตารางเรียน</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveTimetable}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
              isSaving ? "bg-gray-100 text-gray-400" : "bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            }`}
          >
            {isSaving ? "SAVING..." : "💾 บันทึกตารางเรียน"}
          </button>
          <div className="text-xs font-semibold text-gray-400 tracking-wider">TUDEMREG</div>
        </div>
      </div>

      <Timetable selectedCourses={selectedCourses} />

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            รายวิชาที่เลือก ({Array.from(new Set(selectedCourses.map(c => c.course_code))).length} วิชา)
          </h2>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="bg-[#1E0B99] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md hover:-translate-y-1"
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
                <div className={`p-6 md:w-48 flex items-center justify-center ${theme.bg} border-r border-gray-100`}>
                  <span className={`text-3xl font-black italic ${theme.text}`}>{code}</span>
                </div>
                <div className="flex-1 p-6 relative">
                  <h3 className="text-lg font-bold text-gray-900">{course?.course_name}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-3">{course?.faculty} • {course?.department}</p>
                  <div className="mt-1 flex gap-4 text-xs font-medium text-gray-500 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>👨‍🏫 {course?.instructor || "ไม่ระบุ"}</span>
                    <span>|</span>
                    <span>📍 {course?.room || "ไม่ระบุ"}</span>
                  </div>
                  <div className="mt-4 flex gap-6 text-sm text-gray-600">
                    <p>Section: <span className="font-semibold text-gray-900">{course?.section}</span></p>
                    <p>Credit: <span className="font-semibold text-gray-900">{course?.credits} CR.</span></p>
                  </div>
                </div>
                <div className="p-6 md:w-64 border-l border-gray-100 flex flex-col justify-center relative bg-gray-50/50">
                  <button onClick={() => setSelectedCourses(selectedCourses.filter(c => c.course_code !== code))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold">✕ ลบ</button>
                  <div className="text-sm">
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

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[2.5rem] shadow-2xl flex overflow-hidden border border-gray-100">
            <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
              <div className="p-8">
                <h3 className="text-2xl font-black italic mb-4 uppercase">Search Course</h3>
                <input 
                  type="text" 
                  placeholder="รหัส หรือ ชื่อวิชา..." 
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:border-[#1E0B99] shadow-sm transition-all" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
                {uniqueSubjects.map(sub => (
                  <button 
                    key={sub.course_code} 
                    onClick={() => setViewingCourseCode(sub.course_code)} 
                    className={`w-full p-5 rounded-2xl text-left transition-all flex items-center justify-between ${
                      viewingCourseCode === sub.course_code ? "bg-[#1E0B99] text-white shadow-lg" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-black italic text-lg">{sub.course_code}</p>
                      <p className={`text-xs font-bold truncate ${viewingCourseCode === sub.course_code ? "text-blue-100" : "text-gray-400"}`}>
                        {sub.course_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-2/3 flex flex-col bg-white relative p-12 overflow-y-auto">
              <button onClick={() => setIsSearchOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-black font-bold">✕</button>
              
              {viewingCourseCode ? (
                <div>
                  <div className="mb-10">
                    <h2 className="text-6xl font-black italic tracking-tighter mb-2">{viewingCourseCode}</h2>
                    <p className="text-2xl text-gray-500 font-bold">{sectionsToDisplay[0]?.course_name}</p>
                  </div>
                  <div className="space-y-4">
                    {Array.from(new Set(sectionsToDisplay.map(s => s.section))).map(secId => {
                      const sectionGroup = sectionsToDisplay.filter(s => s.section === secId);
                      const firstEntry = sectionGroup[0];
                      const isAdded = selectedCourses.some(c => c.course_code === viewingCourseCode && c.section === secId);
                      return (
                        <div 
                          key={secId} 
                          onClick={() => !isAdded && handleAddCourse(firstEntry)} 
                          className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${
                            isAdded ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-100 hover:border-[#1E0B99] shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                isAdded ? "bg-[#1E0B99] text-white" : "bg-gray-100 text-transparent"
                              }`}>✓</div>
                              <span className="font-black text-2xl italic">SECTION {secId}</span>
                            </div>
                            <span className="text-sm font-black bg-gray-900 text-white px-4 py-1.5 rounded-full">{firstEntry.credits} CR.</span>
                          </div>
                          <div className="grid grid-cols-2 gap-8 text-sm font-bold bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <div>
                              <p className="text-[#1E0B99] uppercase italic mb-3 tracking-widest">Schedule</p>
                              {sectionGroup.map((p, i) => (
                                <p key={i} className="text-gray-700">{p.class_day} {p.class_time_start?.slice(0,5)} - {p.class_time_end?.slice(0,5)}</p>
                              ))}
                            </div>
                            <div>
                              <p className="text-red-500 uppercase italic mb-3 tracking-widest">Exams</p>
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
                <div className="h-full flex items-center justify-center text-gray-200 font-black text-4xl italic">SELECT A COURSE</div>
              )}
            </div>
          </div>
        </div>
      )}

      {customAlert && customAlert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center animate-in fade-in zoom-in duration-200">
            <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${
                customAlert.type === 'error' ? 'bg-red-100 text-red-500' :
                customAlert.type === 'warning' ? 'bg-orange-100 text-orange-500' :
                customAlert.type === 'success' ? 'bg-green-100 text-green-500' :
                'bg-blue-100 text-blue-500'
            }`}>
              {customAlert.type === 'error' && <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
              {customAlert.type === 'warning' && <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              {customAlert.type === 'success' && <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              {customAlert.type === 'info' && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-4">{customAlert.title}</h3>
            <div className="text-sm font-bold text-gray-500 space-y-2 mb-8 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
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

            <div className="flex gap-4">
              {customAlert.type === 'warning' ? (
                <>
                  <button onClick={handleCloseAlert} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">Cancel</button>
                  <button onClick={handleConfirmAdd} className="flex-1 py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs shadow-lg shadow-orange-100">Confirm</button>
                </>
              ) : (
                <button onClick={handleCloseAlert} className={`w-full py-4 font-black rounded-xl text-white transition-all uppercase tracking-widest text-xs shadow-lg ${
                    customAlert.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 
                    customAlert.type === 'success' ? 'bg-green-500 hover:bg-green-600 shadow-green-100' :
                    'bg-[#1E0B99] hover:bg-black shadow-blue-100'
                }`}>
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
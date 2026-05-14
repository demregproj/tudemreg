"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// --- Types ---
type Course = {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  faculty: string;
  type: string;
  prereqs: string[];
};

type PlannedCourse = Course & { user_type: string };

type Semester = {
  id: string;
  term: string;
  year: string;
  courses: PlannedCourse[];
};

type Curriculum = {
  id: string;
  name: string;
  total_credits: number;
};

type Requirement = {
  category_name: string;
  required_credits: number;
};

export default function StudyPlanner() {
  const [plan, setPlan] = useState<Semester[]>([
    { id: "y1s1", term: "1", year: "25X1", courses: [] },
    { id: "y1s2", term: "2", year: "25X1", courses: [] },
    { id: "y1s3", term: "S", year: "25X1", courses: [] }
  ]);
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [curriculumsList, setCurriculumsList] = useState<Curriculum[]>([]);
  const [activeRequirements, setActiveRequirements] = useState<Requirement[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [targetSemesterId, setTargetSemesterId] = useState<string | null>(null);

  const [referenceCurriculumId, setReferenceCurriculumId] = useState<string>("");
  const [isNoReference, setIsNoReference] = useState<boolean>(false);

  // --- 1. Fetch ข้อมูลเริ่มต้นจาก Supabase ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const dummyUserId = "00000000-0000-0000-0000-000000000000";

        // ดึง Profile, วิชาทั้งหมด, และรายชื่อหลักสูตร
        const [resProfile, resCourses, resPrereqs, resCurriculums, resSavedPlan] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", dummyUserId).single(),
          supabase.from("master_courses").select("*"),
          supabase.from("prerequisites").select("*"),
          supabase.from("curriculums").select("*"),
          supabase.from("study_plans").select("*").eq("user_id", dummyUserId)
        ]);

        if (resProfile.data) {
          setUserProfile(resProfile.data);
          setReferenceCurriculumId(resProfile.data.curriculum_id);
        }
        
        if (resCurriculums.data) setCurriculumsList(resCurriculums.data);

        const formattedCourses: Course[] = resCourses.data?.map((c: any) => ({
          id: c.id,
          code: c.course_code,
          name: c.course_name,
          credits: c.credits,
          department: c.department || "-",
          faculty: c.faculty || "-",
          type: c.course_type || "ไม่ระบุ",
          prereqs: resPrereqs.data?.filter((p: any) => p.course_code === c.course_code).map((p: any) => p.prereq_code) || [],
        })) || [];
        setAllCourses(formattedCourses);

        if (resSavedPlan.data && resSavedPlan.data.length > 0) {
          const groupedBySem: Record<string, Semester> = {};
          resSavedPlan.data.forEach((item: any) => {
            const semKey = `${item.academic_year}-${item.term}`;
            if (!groupedBySem[semKey]) {
              groupedBySem[semKey] = { id: `sem-${semKey}`, term: item.term, year: item.academic_year, courses: [] };
            }
            const fullCourse = formattedCourses.find(c => c.code === item.course_code);
            if (fullCourse) {
              groupedBySem[semKey].courses.push({ ...fullCourse, user_type: item.user_type || fullCourse.type });
            }
          });
          setPlan(Object.values(groupedBySem).sort((a, b) => a.year.localeCompare(b.year) || a.term.localeCompare(b.term)));
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // --- 2. ดึงเงื่อนไขหน่วยกิต (Requirements) เมื่อเปลี่ยนหลักสูตรอ้างอิง ---
  useEffect(() => {
    const fetchRequirements = async () => {
      if (isNoReference || !referenceCurriculumId) {
        setActiveRequirements([]);
        return;
      }
      const { data } = await supabase
        .from("curriculum_requirements")
        .select("category_name, required_credits")
        .eq("curriculum_id", referenceCurriculumId);
      
      if (data) setActiveRequirements(data);
    };
    fetchRequirements();
  }, [referenceCurriculumId, isNoReference]);

  const activeCurriculum = curriculumsList.find(c => c.id === referenceCurriculumId);
  const activeCategories = activeRequirements.length > 0 
    ? activeRequirements.map(r => r.category_name) 
    : ["รายวิชาพื้นฐาน", "วิชาศึกษาทั่วไป", "วิชาแกน", "วิชาเลือกเสรี", "อื่นๆ"];

  // --- Logic กรองวิชาและเช็ก Prerequisite ---
  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allCourses.filter(c => 
      c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)
    );
  }, [searchTerm, allCourses]);

  const checkPrerequisite = (prereqCode: string, currentSemesterIndex: number) => {
    for (let i = 0; i < currentSemesterIndex; i++) {
      if (plan[i].courses.some(c => c.code === prereqCode)) return true;
    }
    return false;
  };

  // --- Logic คำนวณหน่วยกิต ---
  const { totalCredits, earnedByCategory } = useMemo(() => {
    let total = 0;
    const byCategory: Record<string, number> = {};
    activeCategories.forEach(cat => byCategory[cat] = 0);
    byCategory["อื่นๆ"] = 0;
    
    plan.forEach(sem => {
      sem.courses.forEach(course => {
        total += course.credits;
        const key = course.user_type || "อื่นๆ";
        if (byCategory[key] !== undefined) byCategory[key] += course.credits;
        else byCategory["อื่นๆ"] += course.credits;
      });
    });
    return { totalCredits: total, earnedByCategory: byCategory };
  }, [plan, activeCategories]);

  const remainingTotal = activeCurriculum ? Math.max(0, activeCurriculum.total_credits - totalCredits) : 0;
  const isComplete = activeCurriculum ? remainingTotal === 0 : false;

  // --- ฟังก์ชันจัดการแผนการเรียน (ที่เผลอลบไป) ---
  const handleAddCourse = (course: Course) => {
    if (!targetSemesterId) return;
    setPlan(prev => prev.map(sem => {
      if (sem.id === targetSemesterId) {
        if (sem.courses.some(c => c.code === course.code)) return sem;
        return { ...sem, courses: [...sem.courses, { ...course, user_type: course.type || "วิชาเลือกเสรี" }] };
      }
      return sem;
    }));
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleRemoveCourse = (semId: string, courseCode: string) => {
    setPlan(prevPlan => prevPlan.map(sem => {
      if (sem.id === semId) {
        return { ...sem, courses: sem.courses.filter(c => c.code !== courseCode) };
      }
      return sem;
    }));
  };

  const handleTypeChange = (semId: string, courseCode: string, newType: string) => {
    setPlan(prev => prev.map(sem => sem.id === semId ? {
      ...sem, courses: sem.courses.map(c => c.code === courseCode ? { ...c, user_type: newType } : c)
    } : sem));
  };

  const handleAddSemester = () => {
    setPlan(prevPlan => {
      const lastSemester = prevPlan[prevPlan.length - 1];
      if (!lastSemester) return prevPlan;
      let nextTerm = "1";
      let nextYear = lastSemester.year;
      if (lastSemester.term === "1") nextTerm = "2";
      else if (lastSemester.term === "2") nextTerm = "S";
      else if (lastSemester.term === "S") {
        nextTerm = "1";
        if (nextYear.startsWith("25X")) {
          const yearNum = parseInt(nextYear.replace("25X", ""), 10);
          nextYear = `25X${yearNum + 1}`;
        }
      }
      return [...prevPlan, { id: `sem-${Date.now()}`, term: nextTerm, year: nextYear, courses: [] }];
    });
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const dummyUserId = "00000000-0000-0000-0000-000000000000";
      await supabase.from("study_plans").delete().eq("user_id", dummyUserId);
      const insertData = plan.flatMap(sem => sem.courses.map(c => ({
        user_id: dummyUserId, course_code: c.code, term: sem.term, academic_year: sem.year, user_type: c.user_type
      })));
      if (insertData.length > 0) await supabase.from("study_plans").insert(insertData);
      alert("💾 บันทึกแผนเรียบร้อย!");
    } catch (e) { alert("❌ ผิดพลาดในการบันทึกข้อมูล"); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-300 italic">LOADING DATABASE...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans text-gray-900">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-5xl font-black mb-6 tracking-tight border-b-[6px] border-gray-900 inline-block pb-2">วางแผนการเรียน</h1>
          <div className="text-xl font-bold space-y-2 text-gray-900">
            <p>คุณ{userProfile?.full_name}</p>
            <p>{userProfile?.faculty} {activeCurriculum?.name}</p>
          </div>

          <div className="mt-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <p className="text-lg font-bold text-gray-900 mb-3">หลักสูตรที่ต้องการใช้อ้างอิง</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <select
                value={referenceCurriculumId}
                onChange={(e) => { setReferenceCurriculumId(e.target.value); setIsNoReference(false); }}
                disabled={isNoReference}
                className="w-full sm:w-80 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm font-bold text-gray-800"
              >
                {curriculumsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                <input type="checkbox" checked={isNoReference} onChange={(e) => setIsNoReference(e.target.checked)} className="w-5 h-5 accent-gray-900" />
                ไม่ต้องการอ้างอิง
              </label>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">หน่วยกิตสะสม</p>
          <p className="text-6xl font-black text-[#1E0B99]">{totalCredits}</p>
        </div>
      </div>

      {/* สถานะหน่วยกิตคงค้าง */}
      {!isNoReference && activeRequirements.length > 0 && (
        <div className={`border-2 rounded-xl p-6 mb-10 flex items-start gap-6 shadow-sm ${isComplete ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">{isComplete ? 'ครบถ้วน!' : `คงค้างรวม ${remainingTotal} หน่วยกิต`}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3">
              {activeRequirements.map(req => {
                const earned = earnedByCategory[req.category_name] || 0;
                const remains = Math.max(0, req.required_credits - earned);
                return (
                  <div key={req.category_name} className="flex justify-between text-sm font-bold">
                    <span className="text-gray-500">{req.category_name} ({req.required_credits})</span>
                    <span className={remains === 0 ? "text-green-600" : "text-red-600"}>{remains === 0 ? "DONE" : `ขาด ${remains}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ตารางเทอมต่างๆ */}
      <div className="space-y-12">
        {plan.map((semester, semIndex) => (
          <div key={semester.id}>
             <h2 className="text-2xl font-black border-b-[3px] border-gray-900 pb-1 mb-6 italic uppercase">Semester {semester.term} | {semester.year}</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {semester.courses.map(course => {
                  const prereqs = course.prereqs.map(p => ({ code: p, isMet: checkPrerequisite(p, semIndex) }));
                  return (
                    <div key={course.code} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative group hover:border-gray-900 transition-all shadow-sm">
                      <button onClick={() => handleRemoveCourse(semester.id, course.code)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      
                      <div className="flex justify-between items-start mb-2 pr-4">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">{course.code}</h3>
                        <span className="text-[9px] font-black bg-blue-50 text-[#1E0B99] px-2 py-1 rounded-md">{course.credits} CR.</span>
                      </div>
                      
                      <p className="text-[11px] font-bold text-gray-500 leading-tight mb-4 flex-1">{course.name}</p>
                      
                      <div className="mb-3">
                        <select 
                          value={course.user_type} 
                          onChange={(e) => handleTypeChange(semester.id, course.code, e.target.value)}
                          className="w-full text-[11px] font-bold bg-gray-50 border rounded-lg p-2 outline-none cursor-pointer focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        >
                          {activeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>

                      {prereqs.length > 0 && (
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 mt-auto space-y-1">
                          {prereqs.map((p, i) => (
                            <div key={i} className={`text-[10px] font-black ${p.isMet ? 'text-green-600' : 'text-red-500'}`}>
                              {p.isMet ? '✓' : '✕'} Prereq: {p.code}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button onClick={() => { setTargetSemesterId(semester.id); setIsSearchOpen(true); }} className="min-h-[160px] border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-black hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all">+ ADD COURSE</button>
             </div>
          </div>
        ))}
      </div>

      {/* ปุ่มบันทึกและเพิ่มเทอม */}
      <div className="mt-16 flex flex-col items-center gap-4 max-w-sm mx-auto">
        <button onClick={handleAddSemester} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all">Add Semester (1-2-S)</button>
        <button onClick={handleSavePlan} disabled={isSaving} className="w-full py-4 bg-[#1E0B99] text-white font-black text-xl rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:bg-gray-400">
          {isSaving ? 'SAVING...' : 'SAVE PLAN'}
        </button>
      </div>

      {/* Modal Search */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] p-8 overflow-hidden flex flex-col">
              <div className="flex justify-between mb-6">
                <h3 className="text-3xl font-black italic">SEARCH COURSE</h3>
                <button onClick={() => setIsSearchOpen(false)} className="text-xl font-bold text-gray-300 hover:text-gray-900">✕</button>
              </div>
              <input type="text" placeholder="รหัส หรือ ชื่อวิชา..." className="w-full bg-gray-100 p-4 rounded-2xl mb-6 outline-none font-bold focus:ring-2 focus:ring-[#1E0B99]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
              <div className="flex-1 overflow-y-auto space-y-3">
                {filteredCourses.map(course => (
                  <button key={course.code} onClick={() => handleAddCourse(course)} className="w-full p-6 border-2 rounded-2xl hover:border-[#1E0B99] text-left flex justify-between items-center group">
                    <div>
                      <p className="text-2xl font-black italic group-hover:text-[#1E0B99]">{course.code}</p>
                      <p className="text-xs text-gray-400">{course.name}</p>
                    </div>
                    <span className="text-3xl text-gray-200 group-hover:text-[#1E0B99]">+</span>
                  </button>
                ))}
                {filteredCourses.length === 0 && (
                  <div className="text-center text-gray-400 font-bold italic py-10">ไม่พบรายวิชาที่ค้นหา</div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
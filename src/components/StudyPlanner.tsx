"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";

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
  is_custom?: boolean;
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
  academic_year?: number; 
};

type Requirement = {
  category_name: string;
  required_credits: number;
};

const getCategoryTheme = (category: string) => {
  if (!category) return "bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-900";
  if (category.includes("ศึกษาทั่วไป")) return "bg-pink-50 text-pink-800 border-pink-200 focus:ring-pink-500";
  if (category.includes("เฉพาะ") || category.includes("แกน")) return "bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500";
  if (category.includes("เลือกเสรี")) return "bg-green-50 text-green-800 border-green-200 focus:ring-green-500";
  if (category.includes("โท") || category.includes("เลือก")) return "bg-purple-50 text-purple-800 border-purple-200 focus:ring-purple-500";
  return "bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-900";
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
  const [selectedFaculty, setSelectedFaculty] = useState<string>("ALL");
  const [targetSemesterId, setTargetSemesterId] = useState<string | null>(null);

  const [referenceCurriculumId, setReferenceCurriculumId] = useState<string>("");
  const [isNoReference, setIsNoReference] = useState<boolean>(false);

  // Searchable Dropdown States
  const [isCurrOpen, setIsCurrOpen] = useState(false);
  const [currSearch, setCurrSearch] = useState("");

  const [customCourseForm, setCustomCourseForm] = useState({ code: "", name: "", credits: 3 });
  const [draggedItem, setDraggedItem] = useState<{ semId: string, courseCode: string } | null>(null);
  const [dragOverSemId, setDragOverSemId] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<{isOpen: boolean, type: 'success' | 'error' | 'warning', title: string, message: string} | null>(null);

  const plannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedUser = localStorage.getItem("regplan_user");
        
        const [resCourses, resPrereqs, resCurriculums] = await Promise.all([
          supabase.from("master_courses").select("*").limit(50000),
          supabase.from("prerequisites").select("*").limit(50000),
          supabase.from("curriculums").select("*")
        ]);

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

        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const realUserId = userData.id; 

          const [resProfile, resSavedPlan] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", realUserId).single(),
            supabase.from("study_plans").select("*").eq("user_id", realUserId)
          ]);

          if (resProfile.data) {
            setUserProfile(resProfile.data);
            setReferenceCurriculumId(resProfile.data.curriculum_id || "");
          }

          if (resSavedPlan.data && resSavedPlan.data.length > 0) {
            const groupedBySem: Record<string, Semester> = {};
            resSavedPlan.data.forEach((item: any) => {
              const semKey = `${item.academic_year}-${item.term}`;
              if (!groupedBySem[semKey]) groupedBySem[semKey] = { id: `sem-${semKey}`, term: item.term, year: item.academic_year, courses: [] };
              
              let courseToAdd: PlannedCourse | undefined;
              if (item.is_custom) {
                courseToAdd = { id: `custom-${item.id}`, code: item.course_code, name: item.custom_name, credits: item.custom_credits, department: "วิชาที่เพิ่มเอง", faculty: "อื่นๆ", type: item.user_type || "", user_type: item.user_type || "", prereqs: [], is_custom: true };
              } else {
                const fullCourse = formattedCourses.find(c => c.code === item.course_code);
                if (fullCourse) courseToAdd = { ...fullCourse, user_type: item.user_type ?? "" };
              }
              if (courseToAdd) groupedBySem[semKey].courses.push(courseToAdd);
            });
            setPlan(Object.values(groupedBySem).sort((a, b) => a.year.localeCompare(b.year) || a.term.localeCompare(b.term)));
          }
        } else {
          setUserProfile({ full_name: " (บุคคลทั่วไป)", faculty: "Guest Mode" });
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

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
  
  const filteredCurriculums = useMemo(() => {
    const term = currSearch.toLowerCase();
    return curriculumsList.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.academic_year?.toString().includes(term)
    );
  }, [curriculumsList, currSearch]);

  const activeCategories = activeRequirements.length > 0 
    ? activeRequirements.map(r => r.category_name) 
    : ["รายวิชาพื้นฐาน", "วิชาศึกษาทั่วไป", "วิชาแกน", "วิชาเลือกเสรี"];

  const uniqueFaculties = useMemo(() => {
    const faculties = new Set(allCourses.map(c => c.faculty).filter(f => f && f !== "-"));
    return Array.from(faculties).sort();
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allCourses.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
      const matchesFaculty = selectedFaculty === "ALL" || c.faculty === selectedFaculty;
      return matchesSearch && matchesFaculty;
    });
  }, [searchTerm, allCourses, selectedFaculty]);

  const checkPrerequisite = (prereqCode: string, currentSemesterIndex: number) => {
    for (let i = 0; i < currentSemesterIndex; i++) {
      if (plan[i].courses.some(c => c.code === prereqCode)) return true;
    }
    return false;
  };

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

  const handleDragStart = (e: React.DragEvent, semId: string, courseCode: string) => {
    setDraggedItem({ semId, courseCode });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, semId: string) => {
    e.preventDefault();
    setDragOverSemId(semId);
  };

  const handleDrop = (e: React.DragEvent, targetSemId: string) => {
    e.preventDefault();
    setDragOverSemId(null);
    if (!draggedItem) return;

    const { semId: sourceSemId, courseCode } = draggedItem;
    if (sourceSemId === targetSemId) return;

    setPlan(prevPlan => {
      const newPlan = [...prevPlan];
      const sourceSemIndex = newPlan.findIndex(s => s.id === sourceSemId);
      const targetSemIndex = newPlan.findIndex(s => s.id === targetSemId);

      const courseToMove = newPlan[sourceSemIndex].courses.find(c => c.code === courseCode);
      if (!courseToMove) return prevPlan;

      if (newPlan[targetSemIndex].courses.some(c => c.code === courseCode)) {
        setCustomAlert({ isOpen: true, type: 'warning', title: 'ย้ายวิชาไม่ได้', message: 'วิชานี้มีอยู่ในเทอมปลายทางแล้วครับ!' });
        return prevPlan;
      }

      newPlan[sourceSemIndex] = {
        ...newPlan[sourceSemIndex],
        courses: newPlan[sourceSemIndex].courses.filter(c => c.code !== courseCode)
      };

      newPlan[targetSemIndex] = {
        ...newPlan[targetSemIndex],
        courses: [...newPlan[targetSemIndex].courses, courseToMove]
      };

      return newPlan;
    });
    setDraggedItem(null);
  };

  // 🟢 ฟังก์ชันสำหรับกดย้ายเทอม (ใช้บนมือถือแทนการลาก)
  const handleMoveCourse = (sourceSemId: string, courseCode: string, targetSemId: string) => {
    if (sourceSemId === targetSemId) return;

    setPlan(prevPlan => {
      const newPlan = [...prevPlan];
      const sourceSemIndex = newPlan.findIndex(s => s.id === sourceSemId);
      const targetSemIndex = newPlan.findIndex(s => s.id === targetSemId);

      const courseToMove = newPlan[sourceSemIndex].courses.find(c => c.code === courseCode);
      if (!courseToMove) return prevPlan;

      if (newPlan[targetSemIndex].courses.some(c => c.code === courseCode)) {
        setCustomAlert({ isOpen: true, type: 'warning', title: 'ย้ายวิชาไม่ได้', message: 'วิชานี้มีอยู่ในเทอมปลายทางแล้วครับ!' });
        return prevPlan;
      }

      newPlan[sourceSemIndex] = { ...newPlan[sourceSemIndex], courses: newPlan[sourceSemIndex].courses.filter(c => c.code !== courseCode) };
      newPlan[targetSemIndex] = { ...newPlan[targetSemIndex], courses: [...newPlan[targetSemIndex].courses, courseToMove] };

      return newPlan;
    });
  };

  const handleAddCourse = (course: Course) => {
    if (!targetSemesterId) return;
    setPlan(prev => prev.map(sem => {
      if (sem.id === targetSemesterId) {
        if (sem.courses.some(c => c.code === course.code)) return sem;
        return { ...sem, courses: [...sem.courses, { ...course, user_type: "" }] };
      }
      return sem;
    }));
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleRemoveCourse = (semId: string, courseCode: string) => {
    setPlan(prevPlan => prevPlan.map(sem => sem.id === semId ? { ...sem, courses: sem.courses.filter(c => c.code !== courseCode) } : sem));
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
    const savedUser = localStorage.getItem("regplan_user");
    if (!savedUser) {
      setCustomAlert({ isOpen: true, type: 'warning', title: 'ไม่สามารถบันทึกได้', message: 'กรุณาล็อกอินเข้าระบบก่อนเพื่อบันทึกแผนการเรียนลงฐานข้อมูลครับ' });
      return;
    }
    
    setIsSaving(true);
    try {
      const userId = JSON.parse(savedUser).id;

      await supabase.from("study_plans").delete().eq("user_id", userId);
      const insertData = plan.flatMap(sem => sem.courses.map(c => ({
        user_id: userId, 
        course_code: c.code, 
        term: sem.term, 
        academic_year: sem.year, 
        user_type: c.user_type,
        is_custom: c.is_custom || false,
        custom_name: c.is_custom ? c.name : null,
        custom_credits: c.is_custom ? c.credits : null
      })));
      
      if (insertData.length > 0) await supabase.from("study_plans").insert(insertData);
      setCustomAlert({ isOpen: true, type: 'success', title: 'บันทึกสำเร็จ!', message: 'แผนการเรียนของคุณถูกอัปเดตเรียบร้อยแล้ว' });
    } catch (e) { 
      setCustomAlert({ isOpen: true, type: 'error', title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleExportImage = async () => {
    if (!plannerRef.current) return;
    try {
      const canvas = await html2canvas(plannerRef.current, {
        scale: 1, // 🟢 ลด scale ลงมาเป็น 1
        backgroundColor: "#FFFFFF", 
        useCORS: true, 
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `REGPLANing-StudyPlan-${new Date().getTime()}.png`;
      
      // 🟢 บังคับให้เบราว์เซอร์มือถือรู้จักปุ่มก่อนกดโหลด
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCustomAlert({ isOpen: true, type: "success", title: "เซฟรูปสำเร็จ!", message: "ระบบได้บันทึกแผนการเรียนเป็นรูปภาพลงในเครื่องของคุณแล้วครับ" });
    } catch (err) {
      console.error("Export Failed:", err);
      setCustomAlert({ isOpen: true, type: "error", title: "เกิดข้อผิดพลาด", message: "ไม่สามารถบันทึกรูปภาพได้ครับ (ขนาดรูปอาจใหญ่เกินไป)" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-300 italic">LOADING DATABASE...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 font-sans text-gray-900">
      
      <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
        <button onClick={handleExportImage} className="w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 bg-[#1E0B99] text-white hover:bg-black hover:-translate-y-1">
          📸 เซฟเป็นรูปภาพ
        </button>
        <button onClick={handleSavePlan} disabled={isSaving} className={`w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex justify-center items-center gap-2 ${isSaving ? "bg-gray-100 text-gray-400" : "bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"}`}>
          {isSaving ? "SAVING..." : "💾 บันทึกแผนการเรียน"}
        </button>
      </div>

      <div ref={plannerRef} className="bg-white p-4 md:p-8 rounded-[2rem]">
        
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight border-b-[4px] md:border-b-[6px] border-gray-900 inline-block pb-2">วางแผนการเรียน</h1>
            <div className="text-lg md:text-xl font-bold space-y-1 md:space-y-2 text-gray-900">
              <p>คุณ{userProfile?.full_name}</p>
              <p className="text-sm md:text-xl text-gray-500 md:text-gray-900">{userProfile?.faculty} {activeCurriculum ? `${activeCurriculum.name} (ปี ${activeCurriculum.academic_year})` : ""}</p>
            </div>

            <div className="mt-6 md:mt-8 bg-gray-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 relative" data-html2canvas-ignore>
              <p className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">หลักสูตรที่ต้องการใช้อ้างอิง</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1">
                  <div 
                    onClick={() => !isNoReference && setIsCurrOpen(!isCurrOpen)}
                    className={`w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm font-bold flex justify-between items-center ${isNoReference ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`truncate pr-2 ${referenceCurriculumId ? "text-gray-900" : "text-gray-400"}`}>
                      {activeCurriculum ? `${activeCurriculum.name} (ปี ${activeCurriculum.academic_year})` : "คลิกเพื่อเลือกหลักสูตร..."}
                    </span>
                    <span>▼</span>
                  </div>

                  {isCurrOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[150] overflow-hidden">
                      <div className="p-3 border-b">
                        <input 
                          type="text"
                          placeholder="พิมพ์ชื่อหรือปีหลักสูตร..."
                          className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:border-[#1E0B99]"
                          value={currSearch}
                          onChange={(e) => setCurrSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCurriculums.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => { setReferenceCurriculumId(c.id); setIsCurrOpen(false); setCurrSearch(""); }}
                            className="p-4 text-sm font-bold text-gray-700 hover:bg-[#1E0B99] hover:text-white cursor-pointer transition-colors flex justify-between"
                          >
                            <span className="truncate pr-2">{c.name}</span>
                            <span className="opacity-50 shrink-0">ปี {c.academic_year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold shrink-0">
                  <input type="checkbox" checked={isNoReference} onChange={(e) => { setIsNoReference(e.target.checked); if(e.target.checked) setIsCurrOpen(false); }} className="w-5 h-5 accent-gray-900" />
                  ไม่ต้องการอ้างอิง
                </label>
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right shrink-0 bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none w-full md:w-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-0">หน่วยกิตสะสม</p>
            <p className="text-5xl md:text-6xl font-black text-[#1E0B99]">{totalCredits}</p>
          </div>
        </div>

        {!isNoReference && activeRequirements.length > 0 && (
          <div className={`border-2 rounded-[2rem] p-5 md:p-8 mb-12 shadow-sm bg-white transition-colors duration-500 ${isComplete ? 'border-green-400 bg-green-50/30' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 border-b-2 border-gray-100 pb-4 gap-3 md:gap-4">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 italic uppercase">
                {isComplete ? '🎉 STRUCTURE COMPLETE!' : `REMAINING: ${remainingTotal} CREDITS`}
              </h3>
              <span className="bg-gray-900 text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 rounded-full uppercase tracking-widest self-start sm:self-auto text-center sm:text-left">
                โครงสร้าง {activeCurriculum?.name} (ปี {activeCurriculum?.academic_year})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {activeRequirements.map(req => {
                const earned = earnedByCategory[req.category_name] || 0;
                const percent = Math.min(100, (earned / req.required_credits) * 100);
                const isDone = earned >= req.required_credits;
                
                return (
                  <div key={req.category_name} className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs md:text-sm font-bold text-gray-700 truncate pr-2 z-10">{req.category_name}</span>
                      <span className={`text-sm md:text-base font-black z-10 ${isDone ? "text-green-600" : "text-[#1E0B99]"}`}>
                        {earned} / {req.required_credits}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden z-10 relative">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${isDone ? 'bg-green-500' : 'bg-[#1E0B99]'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-8 md:space-y-12">
          {plan.map((semester, semIndex) => (
            <div key={semester.id}>
               <h2 className="text-xl md:text-2xl font-black border-b-[3px] border-gray-900 pb-1 mb-4 md:mb-6 italic uppercase">Semester {semester.term} | {semester.year}</h2>
               
               <div 
                 className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2 md:p-4 -m-2 md:-m-4 rounded-3xl transition-colors duration-200 min-h-[120px] md:min-h-[180px] ${dragOverSemId === semester.id ? 'bg-blue-50/50 border-2 border-dashed border-blue-300' : 'border-2 border-transparent'}`}
                 onDragOver={(e) => handleDragOver(e, semester.id)}
                 onDragLeave={() => setDragOverSemId(null)}
                 onDrop={(e) => handleDrop(e, semester.id)}
               >
                  {semester.courses.map(course => {
                    const prereqs = course.prereqs.map(p => ({ code: p, isMet: checkPrerequisite(p, semIndex) }));
                    const theme = getCategoryTheme(course.user_type);
                    
                    return (
                      <div 
                        key={course.code} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, semester.id, course.code)}
                        onDragEnd={() => setDraggedItem(null)}
                        className={`border-2 rounded-2xl p-4 md:p-5 flex flex-col relative group transition-all shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing ${theme}`}
                      >
                        <button onClick={() => handleRemoveCourse(semester.id, course.code)} className="absolute top-2 md:top-3 right-2 md:right-3 text-gray-400 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 md:bg-transparent rounded px-1" data-html2canvas-ignore>✕</button>
                        <div className="flex justify-between items-start mb-2 pr-6">
                          <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter italic">{course.code}</h3>
                          <span className="text-[10px] font-black bg-white/80 text-gray-900 px-2.5 py-1 rounded-md shadow-sm border border-black/5">{course.credits} CR.</span>
                        </div>
                        <p className="text-[11px] md:text-xs font-bold text-gray-600 leading-tight mb-4 flex-1 pr-2 pointer-events-none">{course.name}</p>
                        <div className="mb-3">
                          <select 
                            value={course.user_type || ""} 
                            onChange={(e) => handleTypeChange(semester.id, course.code, e.target.value)}
                            className={`w-full text-[10px] md:text-[11px] font-bold border rounded-lg p-2 md:p-2.5 outline-none cursor-pointer transition-colors focus:ring-2 bg-white/80 ${theme}`}
                            data-html2canvas-ignore
                          >
                            <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                            {activeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="อื่นๆ">อื่นๆ</option>
                          </select>
                          <div className="hidden text-[11px] font-bold mt-1" data-html2canvas-show>
                             หมวด: {course.user_type || "ไม่ได้เลือก"}
                          </div>
                        </div>

                        {/* 🟢 กล่องย้ายเทอม (ซ่อนบนคอม โผล่เฉพาะมือถือ) */}
                        <div className="md:hidden mt-2" data-html2canvas-ignore>
                          <select
                            value=""
                            onChange={(e) => {
                               if (e.target.value) handleMoveCourse(semester.id, course.code, e.target.value);
                            }}
                            className={`w-full text-[10px] md:text-[11px] font-bold border border-dashed border-gray-400 rounded-lg p-2 outline-none cursor-pointer bg-white/50 text-gray-700`}
                          >
                            <option value="" disabled>🔄 แตะเพื่อย้ายเทอม...</option>
                            {plan.map(s => (
                              <option key={`move-${s.id}`} value={s.id} disabled={s.id === semester.id}>
                                 ย้ายไป 👉 ปี {s.year} เทอม {s.term}
                              </option>
                            ))}
                          </select>
                        </div>

                        {prereqs.length > 0 && (
                          <div className="bg-white/80 p-2 md:p-2.5 rounded-xl border border-black/5 mt-auto space-y-1">
                            {prereqs.map((p, i) => (
                              <div key={i} className={`text-[9px] md:text-[10px] font-black ${p.isMet ? 'text-green-600' : 'text-red-500'}`}>
                                {p.isMet ? '✓' : '✕'} Prereq: {p.code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => { setTargetSemesterId(semester.id); setIsSearchOpen(true); }} className="min-h-[120px] md:min-h-[160px] border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-black hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all" data-html2canvas-ignore>+ ADD COURSE</button>
               </div>
            </div>
          ))}
        </div>
        
        <div className="hidden mt-8 pt-4 border-t-2 border-gray-100 flex justify-between items-center" data-html2canvas-show>
           <span className="text-xs md:text-sm font-bold text-gray-400 uppercase">Generated by</span>
           <span className="text-[#1E0B99] font-black italic text-lg md:text-xl tracking-tighter">REG<span className="text-gray-900">PLANing</span> <span className="text-green-500">✔</span></span>
        </div>

      </div>

      <div className="mt-12 md:mt-16 flex flex-col items-center gap-4 max-w-sm mx-auto">
        <button onClick={handleAddSemester} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all">Add Semester (1-2-S)</button>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4">
           <div className="bg-white w-full max-w-3xl h-[95vh] md:h-auto md:max-h-[85vh] rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 overflow-hidden flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-xl md:text-3xl font-black italic uppercase text-gray-900">Search Course</h3>
                <button onClick={() => setIsSearchOpen(false)} className="text-sm md:text-xl font-black text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors">✕</button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
                <input 
                  type="text" 
                  placeholder="พิมพ์ รหัสวิชา หรือ ชื่อวิชา..." 
                  className="flex-1 bg-gray-50 border-2 border-gray-100 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-gray-900 focus:border-[#1E0B99] transition-colors text-sm md:text-base" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <select 
                  value={selectedFaculty} 
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="bg-gray-50 border-2 border-gray-100 p-3 md:p-4 rounded-xl md:rounded-2xl outline-none font-bold text-gray-600 focus:border-[#1E0B99] transition-colors cursor-pointer w-full sm:w-auto sm:min-w-[200px] text-sm md:text-base"
                >
                  <option value="ALL">ทุกคณะ / ทุกหน่วยงาน</option>
                  {uniqueFaculties.map(faculty => <option key={faculty} value={faculty}>{faculty}</option>)}
                </select>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-2 scrollbar-hide">
                {filteredCourses.map(course => (
                  <button key={course.code} onClick={() => handleAddCourse(course)} className="w-full p-4 md:p-5 border-2 border-gray-100 rounded-xl md:rounded-2xl hover:border-[#1E0B99] text-left flex flex-col sm:flex-row justify-between sm:items-center gap-3 group bg-white transition-colors">
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 md:gap-3 mb-1.5">
                        <p className="text-xl md:text-2xl font-black italic text-gray-900 group-hover:text-[#1E0B99] transition-colors">{course.code}</p>
                        <span className="text-[9px] md:text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 md:px-2.5 rounded-md truncate max-w-[150px] sm:max-w-none">{course.faculty}</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 font-bold truncate">{course.name}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50">
                      <span className="text-xs md:text-sm font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">{course.credits} CR</span>
                      <span className="text-2xl md:text-3xl text-gray-200 group-hover:text-[#1E0B99] transition-colors">+</span>
                    </div>
                  </button>
                ))}

                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-dashed border-gray-100">
                  <p className="text-xs md:text-sm font-black text-gray-400 mb-3 md:mb-4 uppercase italic">หาไม่เจอ? เพิ่มวิชาเองได้ที่นี่</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      placeholder="รหัสวิชา (เช่น AC101)" 
                      className="bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold text-sm w-full sm:w-1/3"
                      value={customCourseForm.code}
                      onChange={(e) => setCustomCourseForm({...customCourseForm, code: e.target.value.toUpperCase()})}
                    />
                    <input 
                      placeholder="ชื่อวิชา" 
                      className="bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold text-sm w-full sm:w-1/3"
                      value={customCourseForm.name}
                      onChange={(e) => setCustomCourseForm({...customCourseForm, name: e.target.value})}
                    />
                    <div className="flex gap-2 w-full sm:w-1/3">
                      <input 
                        type="number" 
                        placeholder="CR" 
                        className="w-16 sm:w-20 bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold text-sm text-center"
                        value={customCourseForm.credits}
                        onChange={(e) => setCustomCourseForm({...customCourseForm, credits: parseInt(e.target.value) || 0})}
                      />
                      <button 
                        onClick={() => {
                          if(!customCourseForm.code || !customCourseForm.name) {
                            setCustomAlert({ isOpen: true, type: 'warning', title: 'ข้อมูลไม่ครบ', message: 'กรุณากรอกรหัสและชื่อวิชาให้ครบถ้วนครับ' });
                            return;
                          }
                          const newCourse: PlannedCourse = {
                            id: `custom-${Date.now()}`,
                            code: customCourseForm.code,
                            name: customCourseForm.name,
                            credits: customCourseForm.credits,
                            department: "วิชาที่เพิ่มเอง",
                            faculty: "อื่นๆ",
                            type: "", 
                            user_type: "", 
                            prereqs: [],
                            is_custom: true
                          };
                          handleAddCourse(newCourse);
                          setCustomCourseForm({ code: "", name: "", credits: 3 });
                        }}
                        className="flex-1 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-colors"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {customAlert && customAlert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 md:p-10 text-center animate-in fade-in zoom-in duration-200">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full mb-6 ${customAlert.type === 'error' ? 'bg-red-100 text-red-500' : customAlert.type === 'warning' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'}`}>
              <span className="text-2xl md:text-3xl">{customAlert.type === 'error' ? '❌' : customAlert.type === 'warning' ? '⚠️' : '✅'}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4">{customAlert.title}</h3>
            <p className="text-xs md:text-sm font-bold text-gray-500 mb-6 md:mb-8 bg-gray-50 p-4 rounded-xl md:rounded-2xl border border-gray-100 leading-relaxed">{customAlert.message}</p>
            <button 
              onClick={() => setCustomAlert(null)} 
              className={`w-full py-3 md:py-4 font-black rounded-xl text-white transition-all uppercase tracking-widest text-[10px] md:text-xs shadow-lg ${customAlert.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : customAlert.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-[#1E0B99] hover:bg-black shadow-blue-100'}`}
            >
              OKAY
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        [data-html2canvas-show] { display: none !important; }
        .html2canvas-container [data-html2canvas-show] { display: flex !important; }
        .html2canvas-container [data-html2canvas-ignore] { display: none !important; }
      `}} />
    </div>
  );
}
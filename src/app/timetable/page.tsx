// src/app/timetable/page.tsx

import { supabase } from "@/lib/supabase";
import CourseManager from "@/components/CourseManager";

// 🟢 1. ปิด Cache เพื่อให้เว็บดึงข้อมูลใหม่สดๆ จากฐานข้อมูลเสมอ
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  // 🟢 2. ดึงข้อมูลทั้ง 2 ตารางพร้อมกัน (วิชาหลัก และ ตารางเรียน)
  const [resCourses, resSections] = await Promise.all([
    supabase.from("master_courses").select("*").limit(50000),
    supabase.from("term_sections").select("*").limit(50000)
  ]);

  const masterCourses = resCourses.data || [];
  const sections = resSections.data || [];

  // 🟢 3. นำข้อมูลตารางเรียนมาจับคู่กับวิชาหลักให้เป็นก้อนเดียวกัน
  const combinedCourses = masterCourses.map(master => {
    // หาวิชาใน term_sections ที่รหัสตรงกัน
    const courseSections = sections.filter(s => s.course_code === master.course_code);
    
    // ถ้าวิชานี้มีเปิดสอน (มีเซคชั่น)
    if (courseSections.length > 0) {
      return courseSections.map(sec => ({
        ...master, // เอาชื่อวิชา, หน่วยกิต มาเป็นฐาน
        ...sec,    // เอา section, เวลาเรียน มาทับ
        id: sec.id // สำคัญ: ใช้ id ของ section เพื่อใช้บันทึกตารางเรียน
      }));
    } else {
      // ถ้าไม่มีเปิดสอน ก็ส่งไปแค่วิชาหลัก (เพื่อให้ค้นหาเจอ แต่ขึ้นว่าไม่มีเวลาเรียน)
      return [{ ...master }];
    }
  }).flat();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="py-8">
        <CourseManager allCourses={combinedCourses} />
      </div>
    </div>
  );
}
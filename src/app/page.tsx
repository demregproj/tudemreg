import { supabase } from "@/lib/supabase";
import CourseManager from "@/components/CourseManager";

// เพิ่มบรรทัดนี้เพื่อให้ Next.js ดึงข้อมูลใหม่เสมอ (ไม่จำ Cache เก่า)
export const revalidate = 0; 

export default async function Home() {
  // 1. ดึงข้อมูลจากตาราง sections และ Join ข้อมูลที่ขาดจากตาราง courses
  const { data, error } = await supabase
    .from("sections")
    .select(`
      *,
      courses (
        course_name,
        credits,
        course_type,
        faculty,
        department
      )
    `);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
        <div className="p-8 text-red-500 bg-white rounded-2xl shadow-sm font-bold">
          ❌ ดึงข้อมูลไม่สำเร็จ: {error.message}
        </div>
      </div>
    );
  }

  // 2. แปลงรูปร่างข้อมูล (Flatten) ให้กลับมาเป็นก้อนเดียวเพื่อให้ CourseManager อ่านง่าย
  const formattedCourses = data?.map((item: any) => ({
    ...item,
    course_name: item.courses?.course_name || "ไม่พบชื่อวิชา",
    credits: item.courses?.credits || "-",
    course_type: item.courses?.course_type || "ไม่ระบุ",
    faculty: item.courses?.faculty || "-",
    department: item.courses?.department || "-"
  })) || [];

  return (
    <main className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ลบ h1 ออกเพราะใน CourseManager มี Header ที่สวยกว่าอยู่แล้ว */}
        
        {/* ส่งข้อมูลที่ประกอบร่างแล้วเข้าไป */}
        <CourseManager allCourses={formattedCourses} />
        
      </div>
    </main>
  );
}
import { supabase } from "@/lib/supabase";
import CourseManager from "@/components/CourseManager";

export const revalidate = 3600;

export default async function TimetablePage() {
  const { data: courses } = await supabase.from("master_courses").select("*").limit(50000);
  
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ❌ นำ Navbar ออกแล้วเพราะมีอยู่ใน layout.tsx หลัก */}
      <div className="py-8">
        <CourseManager allCourses={courses || []} />
      </div>
    </div>
  );
}
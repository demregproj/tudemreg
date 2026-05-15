import { supabase } from "@/lib/supabase";
import CourseManager from "@/components/CourseManager";

export const revalidate = 3600;

export default async function TimetablePage() {
  const { data: courses } = await supabase.from("master_courses").select("*");
  
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="py-8">
        <CourseManager allCourses={courses || []} />
      </div>
    </div>
  );
}
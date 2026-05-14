"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";

export default function CSVImportPage() {
  const [data, setData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data);
          setStatus(`อ่านข้อมูลสำเร็จ: ${results.data.length} รายการ`);
        },
      });
    }
  };

  const handleUpload = async () => {
    if (data.length === 0) return;
    setIsUploading(true);
    setStatus("กำลังนำเข้าข้อมูล...");

    try {
      // 1. นำเข้าตาราง courses (กรองเอาเฉพาะวิชาที่ไม่ซ้ำกัน)
      const uniqueCoursesMap = new Map();
      data.forEach(item => {
        uniqueCoursesMap.set(item.course_code, {
          course_code: item.course_code,
          course_name: item.course_name,
          credits: parseInt(item.credits) || 3,
          department: item.department || "-",
          faculty: item.faculty || "-",
          course_type: item.course_type || "ไม่ระบุ"
        });
      });

      const { error: courseError } = await supabase
        .from("courses")
        .upsert(Array.from(uniqueCoursesMap.values()), { onConflict: "course_code" });

      if (courseError) throw courseError;

      // 2. นำเข้าตาราง sections (ข้อมูลทุกแถวรวมวันเรียนและวันสอบ)
      const sectionsToInsert = data.map(item => ({
        course_code: item.course_code,
        section: item.section,
        class_type: item.class_type || "Lecture",
        instructor: item.instructor || "-",
        room: item.room || "-",
        class_day: item.class_day,
        class_time_start: item.class_time_start,
        class_time_end: item.class_time_end,
        midterm_date: item.midterm_date || null,
        midterm_time_start: item.midterm_time_start || null,
        midterm_time_end: item.midterm_time_end || null,
        final_date: item.final_date || null,
        final_time_start: item.final_time_start || null,
        final_time_end: item.final_time_end || null,
      }));

      // ลบข้อมูลเก่าใน sections เฉพาะวิชาที่มีในไฟล์ เพื่อป้องกันข้อมูลขยะ (Optional)
      // หรือจะใช้ insert ตามปกติก็ได้ครับ
      const { error: sectionError } = await supabase
        .from("sections")
        .insert(sectionsToInsert);

      if (sectionError) throw sectionError;

      setStatus(`✅ สำเร็จ! นำเข้าวิชา ${uniqueCoursesMap.size} รายการ และเซคชั่น ${sectionsToInsert.length} รายการ`);
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ ข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 font-sans">
      <h1 className="text-4xl font-black italic mb-8 uppercase border-b-4 border-gray-900 pb-2">Admin Import</h1>
      <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl">
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-6 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {status && <p className="mb-4 text-sm font-bold text-blue-600">{status}</p>}
        <button onClick={handleUpload} disabled={isUploading || data.length === 0} className="w-full bg-[#1E0B99] text-white py-4 rounded-2xl font-black text-xl hover:bg-black transition-all">START IMPORTING DATA</button>
      </div>
    </div>
  );
}
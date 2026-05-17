"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";

export default function CSVImportPage() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // 🟢 1. สร้างฟังก์ชันปรับ Format วันที่ (tue, TUE, Tuesday -> Tue)
          const formatDay = (dayStr: string) => {
            if (!dayStr) return dayStr;
            // ลบช่องว่างและตัดมาแค่ 3 ตัวอักษรแรก
            const shortDay = dayStr.trim().substring(0, 3); 
            // ตัวแรกพิมพ์ใหญ่ + ตัวที่เหลือพิมพ์เล็ก
            return shortDay.charAt(0).toUpperCase() + shortDay.slice(1).toLowerCase();
          };

          // 🟢 2. วนลูปทำความสะอาดข้อมูลทุกบรรทัดก่อนเก็บลง State
          const cleanedData = results.data.map((item: any) => {
            if (item.class_day) {
              item.class_day = formatDay(item.class_day);
            }
            return item;
          });

          // 🟢 3. อัปเดตข้อมูลที่คลีนแล้วลงไป
          setData(cleanedData);
          setHeaders(results.meta.fields || []);
          setStatus(`อ่านข้อมูลสำเร็จ: ${results.data.length} รายการ (พบหัวตาราง: ${results.meta.fields?.length} ช่อง)`);
        },
      });
    }
  };

  const deduplicate = (arr: any[], keyFn: (item: any) => string) => {
    const map = new Map();
    arr.forEach(item => {
      map.set(keyFn(item), item);
    });
    return Array.from(map.values());
  };

  // 🟢 ฟังก์ชันนี้ถูกอัปเกรด: จัดการทั้ง "ค่าว่าง", "ช่องว่างซ่อนเร้น", และ "ฟอร์แมตวันที่"
  const formatAndCleanData = (arr: any[]) => {
    return arr.map(item => {
      const newItem = { ...item };
      Object.keys(newItem).forEach(key => {
        
        // 1. ลบช่องว่างหัว/ท้าย (Trailing spaces) เผื่อเผลอเคาะ Spacebar ใน Excel
        if (typeof newItem[key] === 'string') {
          newItem[key] = newItem[key].trim();
        }

        // 2. 🟢 ถ้าเป็นค่าว่าง "" ให้ส่งเป็น null เพื่อแก้ Error: invalid input syntax for integer
        if (newItem[key] === "") {
          newItem[key] = null;
        }
        // 3. จัดการฟอร์แมตวันที่ (จาก DD/MM/YY เป็น YYYY-MM-DD)
        else if (key.includes('date') && newItem[key]) {
          const dateStr = String(newItem[key]);
          const parts = dateStr.split('/');
          
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            let year = parts[2];
            
            if (year.length === 2) {
              year = '20' + year;
            } else if (year.length === 4 && parseInt(year) > 2500) {
              year = (parseInt(year) - 543).toString();
            }
            
            newItem[key] = `${year}-${month}-${day}`;
          }
        }
      });
      return newItem;
    });
  };

  const handleUpload = async () => {
    if (data.length === 0) return;
    setIsUploading(true);
    setStatus("⏳ กำลังเตรียมข้อมูลและทำความสะอาดค่าว่าง...");

    try {
      // 🟢 นำข้อมูลมาผ่านเครื่องซักผ้า (ทำความสะอาดข้อมูล) ก่อนอัปโหลด
      const cleanedData = formatAndCleanData(data);

      if (headers.includes("course_name") && !headers.includes("section")) {
        // --- ตาราง master_courses ---
        setStatus("กำลังอัปเดตรายชื่อวิชาหลัก (Master Courses)...");
        const uniqueData = deduplicate(cleanedData, item => item.course_code);
        const { error } = await supabase.from("master_courses").upsert(uniqueData, { onConflict: "course_code" });
        if (error) throw error;
        setStatus(`✅ อัปเดตข้อมูลวิชาหลัก ${uniqueData.length} รายการ เรียบร้อยแล้ว!`);
      } 
      else if (headers.includes("section")) {
        // --- ตาราง term_sections ---
        setStatus("กำลังตรวจสอบข้อมูลวิชาหลักในระบบ...");
        const { data: existingCourses, error: fetchErr } = await supabase.from("master_courses").select("course_code");
        if (fetchErr) throw fetchErr;
        const validCodes = new Set(existingCourses.map(c => c.course_code));

        const validData = cleanedData.filter(item => validCodes.has(item.course_code));
        
        if (validData.length === 0) throw new Error(`ไม่พบวิชาในระบบเลย กรุณาอัปเดต Master Courses ก่อนครับ`);

        setStatus(`กำลังอัปเดตตารางเรียน...`);
        const courseCodes = Array.from(new Set(validData.map(item => item.course_code)));
        await supabase.from("term_sections").delete().in("course_code", courseCodes);
        const { error } = await supabase.from("term_sections").insert(validData);
        if (error) throw error;

        setStatus(`✅ อัปเดตตารางเรียน ${validData.length} รายการ สำเร็จ!`);
      }
      else if (headers.includes("prereq_code")) {
        // --- ตาราง prerequisites ---
        setStatus("กำลังอัปเดตวิชาบังคับก่อน...");
        const { error } = await supabase.from("prerequisites").upsert(cleanedData, { onConflict: "course_code,prereq_code" });
        if (error) throw error;
        setStatus(`✅ อัปเดตวิชาบังคับก่อน ${cleanedData.length} รายการ สำเร็จ!`);
      }
      else if (headers.includes("total_credits") && !headers.includes("category_name")) {
        // --- ตาราง curriculums ---
        setStatus("กำลังอัปเดตข้อมูลหลักสูตร (Curriculums)...");
        const uniqueData = deduplicate(cleanedData, item => item.id);
        const { error } = await supabase.from("curriculums").upsert(uniqueData, { onConflict: "id" });
        if (error) throw error;
        setStatus(`✅ อัปเดตข้อมูลหลักสูตร ${uniqueData.length} รายการ เรียบร้อยแล้ว!`);
      }
      else if (headers.includes("category_name")) {
        // --- ตาราง curriculum_requirements ---
        setStatus("กำลังอัปเดตโครงสร้างหน่วยกิต...");
        const { error } = await supabase.from("curriculum_requirements").upsert(cleanedData, { onConflict: "curriculum_id,category_name" });
        if (error) throw error;
        setStatus(`✅ อัปเดตโครงสร้างหน่วยกิต ${cleanedData.length} รายการ สำเร็จ!`);
      }
      else {
        throw new Error("ระบบไม่พบหัวตารางที่คุ้นเคยในไฟล์ CSV นี้ กรุณาตรวจสอบชื่อคอลัมน์ครับ");
      }
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ ข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 font-sans">
      <h1 className="text-4xl font-black italic mb-8 uppercase border-b-4 border-gray-900 pb-2 text-[#1E0B99]">Data Importer</h1>
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="mb-8">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Detected Columns:</p>
           <div className="flex flex-wrap gap-2">
             {headers.length > 0 ? headers.map(h => (
               <span key={h} className="bg-blue-50 text-[#1E0B99] text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">{h}</span>
             )) : <span className="text-sm font-bold text-gray-300 italic">รอการอัปโหลดไฟล์...</span>}
           </div>
        </div>

        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="w-full mb-8 block text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#1E0B99] file:text-white hover:file:bg-black transition-all cursor-pointer bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200" 
        />

        {status && (
          <div className={`mb-8 p-5 rounded-2xl border-2 text-sm font-bold ${status.includes('✅') ? 'bg-green-50 border-green-100 text-green-700' : status.includes('❌') ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
             {status}
          </div>
        )}

        <button 
          onClick={handleUpload} 
          disabled={isUploading || data.length === 0} 
          className="w-full bg-[#1E0B99] text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl shadow-blue-100 disabled:bg-gray-200 disabled:shadow-none"
        >
          {isUploading ? "PROCESS... ⏳" : "START UPSERT DATA 🚀"}
        </button>
      </div>
    </div>
  );
}
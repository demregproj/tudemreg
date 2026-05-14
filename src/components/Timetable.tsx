"use client";

import React, { useState } from "react";

const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const DAYS = [
  { id: "Sun", label: "อาทิตย์" },
  { id: "Mon", label: "จันทร์" },
  { id: "Tue", label: "อังคาร" },
  { id: "Wed", label: "พุธ" },
  { id: "Thu", label: "พฤหัส" },
  { id: "Fri", label: "ศุกร์" },
  { id: "Sat", label: "เสาร์" },
];

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getCourseTheme = (code: string) => {
  if (!code) return { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-400", cardBorder: "border-gray-200" };
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const themes = [
    { bg: "bg-[#E0F2FE]", border: "border-[#7DD3FC]", text: "text-[#0369A1]", dot: "bg-[#0369A1]", cardBorder: "border-[#7DD3FC]" },
    { bg: "bg-[#DCFCE7]", border: "border-[#86EFAC]", text: "text-[#15803D]", dot: "bg-[#15803D]", cardBorder: "border-[#86EFAC]" },
    { bg: "bg-[#FCE7F3]", border: "border-[#F9A8D4]", text: "text-[#BE185D]", dot: "bg-[#BE185D]", cardBorder: "border-[#F9A8D4]" },
    { bg: "bg-[#FEF9C3]", border: "border-[#FDE047]", text: "text-[#A16207]", dot: "bg-[#A16207]", cardBorder: "border-[#FDE047]" },
    { bg: "bg-[#EDE9FE]", border: "border-[#C4B5FD]", text: "text-[#6D28D9]", dot: "bg-[#6D28D9]", cardBorder: "border-[#C4B5FD]" },
  ];
  return themes[hash % themes.length];
};

export default function Timetable({ selectedCourses }: { selectedCourses: any[] }) {
  const [activeTab, setActiveTab] = useState<"class" | "exam">("class");

  const uniqueExams = Array.from(new Map(selectedCourses.map(c => [c.course_code, c])).values());

  const midtermSchedule = uniqueExams
    .filter(c => c.midterm_date)
    .sort((a, b) => new Date(a.midterm_date).getTime() - new Date(b.midterm_date).getTime());
    
  const finalSchedule = uniqueExams
    .filter(c => c.final_date)
    .sort((a, b) => new Date(a.final_date).getTime() - new Date(b.final_date).getTime());

  const ExamSection = ({ title, schedule }: { title: string, schedule: any[] }) => (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xl font-black text-gray-900 italic uppercase border-b-4 border-gray-900 pb-1">{title}</h3>
        <div className="flex-1 h-[2px] bg-gray-100"></div>
      </div>
      <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-5 before:w-0.5 before:bg-gray-100">
        {schedule.map((course) => {
          const theme = getCourseTheme(course.course_code);
          const isMid = title.includes('Midterm');
          const date = isMid ? course.midterm_date : course.final_date;
          const start = isMid ? course.midterm_time_start : course.final_time_start;
          const end = isMid ? course.midterm_time_end : course.final_time_end;
          
          return (
            <div key={`${title}-${course.course_code}`} className="relative pl-14 flex items-center">
              <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center ${theme.dot}`}>
                <span className="text-white text-[10px] font-black italic">{course.course_code.slice(0, 2)}</span>
              </div>
              <div className="flex-1 flex flex-col md:flex-row items-center justify-between p-5 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-200 hover:bg-white transition-all shadow-sm">
                <div className="flex-1">
                  <span className={`text-base font-black italic ${theme.text}`}>{course.course_code}</span>
                  <h4 className="text-[13px] font-bold text-gray-600">{course.course_name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-black text-gray-900">
                    {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </p>
                  <p className="text-lg font-black text-gray-800">
                    {start ? start.slice(0, 5) : '--:--'} - {end ? end.slice(0, 5) : '--:--'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
        <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1 border border-gray-200 shadow-inner">
          <button onClick={() => setActiveTab("class")} className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${activeTab === "class" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>ตารางเรียน</button>
          <button onClick={() => setActiveTab("exam")} className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${activeTab === "exam" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>ตารางสอบ</button>
        </div>
      </div>

      {activeTab === "class" ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px] grid grid-cols-[100px_repeat(13,1fr)]">
              <div className="bg-gray-50/80 border-b border-r border-gray-100 p-4"></div>
              {TIME_SLOTS.slice(0, -1).map((time, i) => (
                <div key={time} className="p-3 text-[10px] text-center text-gray-400 font-bold bg-gray-50/80 border-b border-r border-gray-100 uppercase">
                  {time} - {TIME_SLOTS[i+1]}
                </div>
              ))}
              
              {DAYS.map((day) => (
                <React.Fragment key={day.id}>
                  <div className="p-4 border-b border-r border-gray-100 flex items-center justify-center text-[12px] font-bold text-gray-500 bg-gray-50/30">
                    {day.label}
                  </div>
                  {TIME_SLOTS.slice(0, -1).map((time) => {
                    const slotStart = timeToMinutes(time);
                    
                    const coursesInSlot = selectedCourses.filter(c => 
                      c.class_day === day.id && 
                      timeToMinutes(c.class_time_start) >= slotStart && 
                      timeToMinutes(c.class_time_start) < slotStart + 60
                    );
                    
                    return (
                      <div key={`${day.id}-${time}`} className="relative h-20 border-b border-r border-gray-50/50 bg-white">
                        {coursesInSlot.map((course) => {
                          const startMins = timeToMinutes(course.class_time_start);
                          const duration = timeToMinutes(course.class_time_end) - startMins;
                          const offsetLeft = ((startMins - slotStart) / 60) * 100;
                          const width = (duration / 60) * 100;
                          const theme = getCourseTheme(course.course_code);
                          
                          return (
                            <div 
                              key={`${course.course_code}-${course.section}`} 
                              // ปรับ CSS ให้บล็อกขยายเต็มบน-ล่าง สวยงาม
                              className={`absolute top-1.5 bottom-1.5 ${theme.bg} ${theme.text} ${theme.border} border-2 rounded-[0.8rem] z-10 flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:z-20 hover:scale-[1.02] transition-all cursor-default group overflow-hidden`} 
                              style={{ left: `${offsetLeft}%`, width: `calc(${width}% - 6px)`, marginLeft: '3px' }}
                            >
                              <span className="font-black text-[13px] tracking-tight">{course.course_code}</span>
                              <span className="text-[9px] font-bold opacity-75 mt-0.5 truncate w-full text-center">
                                Sec {course.section}
                              </span>
                              
                              {/* Tooltip รายละเอียดเวลาเอาเมาส์ชี้ */}
                              <div className="absolute hidden group-hover:flex flex-col bottom-full mb-2 bg-gray-900 text-white px-3 py-2 rounded-xl shadow-xl z-50 whitespace-nowrap pointer-events-none">
                                <span className="font-bold text-xs mb-1">{course.course_name}</span>
                                <span className="text-[10px] text-gray-300">
                                  {course.class_time_start?.slice(0,5)} - {course.class_time_end?.slice(0,5)} • ห้อง {course.room || '-'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
          <ExamSection title="Midterm Exam" schedule={midtermSchedule} />
          <div className="my-10 h-px bg-gray-100"></div>
          <ExamSection title="Final Exam" schedule={finalSchedule} />
        </div>
      )}
    </div>
  );
}
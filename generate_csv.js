const fs = require('fs');

// ข้อมูลตั้งต้นสำหรับสุ่ม
const faculties = [
  { fac: "คณะพาณิชยศาสตร์และการบัญชี", depts: ["ภาควิชาการบัญชี", "ภาควิชาการตลาด", "ภาควิชาการเงิน"] },
  { fac: "คณะแพทยศาสตร์", depts: ["ภาควิชาปรีคลินิก", "ภาควิชาศัลยศาสตร์", "ภาควิชากุมารเวชศาสตร์"] },
  { fac: "คณะศิลปศาสตร์", depts: ["ภาควิชาภาษาอังกฤษ", "ภาควิชาภาษาฝรั่งเศส", "ภาควิชาประวัติศาสตร์"] },
  { fac: "คณะวิศวกรรมศาสตร์", depts: ["ภาควิชาวิศวกรรมคอมพิวเตอร์", "ภาควิชาวิศวกรรมโยธา", "ภาควิชาวิศวกรรมไฟฟ้า"] },
  { fac: "คณะนิติศาสตร์", depts: ["ภาควิชากฎหมายแพ่ง", "ภาควิชากฎหมายอาญา", "ภาควิชากฎหมายมหาชน"] }
];

const coursePrefixes = ["AC", "MK", "FN", "MD", "SU", "PD", "EG", "FR", "HS", "CS", "CE", "EE", "LW", "LA", "LP"];
const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์"];
const times = [
  { s: "08:00:00", e: "09:30:00" }, { s: "09:30:00", e: "11:00:00" }, { s: "09:30:00", e: "12:30:00" },
  { s: "13:00:00", e: "14:30:00" }, { s: "13:30:00", e: "16:30:00" }, { s: "15:00:00", e: "16:30:00" }
];

// ฟังก์ชันสุ่มตัวเลข
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// สร้างหัวคอลัมน์ (Header) ให้ตรงกับฐานข้อมูลเป๊ะๆ
let csvContent = "course_code,course_name,department,faculty,section,credit,class_type,instructor,room,class_day,class_time_start,class_time_end,midterm_date,midterm_time_start,midterm_time_end,final_date,final_time_start,final_time_end,capacity,note,prerequisite\n";

let totalRows = 0;

// วนลูปสร้างวิชา (ประมาณ 150 วิชา วิชาละ 2-5 เซคชั่น = 500+ รายการ)
for (let i = 1; i <= 150; i++) {
  const facObj = randItem(faculties);
  const dept = randItem(facObj.depts);
  const prefix = randItem(coursePrefixes);
  const code = `${prefix}${rand(100, 499)}`;
  const credit = rand(2, 4);
  const sectionsCount = rand(2, 5); // 1 วิชา มี 2 ถึง 5 เซคชั่น
  
  // วันสอบกลางภาคและปลายภาค (ทุกเซคชั่นในวิชาเดียวกัน ต้องสอบพร้อมกัน)
  const midDay = rand(1, 30).toString().padStart(2, '0');
  const finDay = rand(1, 30).toString().padStart(2, '0');
  const midterm_date = `2026-09-${midDay}`;
  const final_date = `2026-11-${finDay}`;
  
  const midTime = randItem(times);
  const finTime = randItem(times);

  for (let sec = 1; sec <= sectionsCount; sec++) {
    const section = `1000${sec}`;
    const timeObj = randItem(times);
    const day = randItem(days);
    const capacity = rand(30, 150);
    const instructor = `อ. ${prefix}${sec} SSSS`;
    
    // จัดข้อมูลลง CSV (ใช้เครื่องหมายคำพูดครอบเผื่อมีช่องว่าง)
    csvContent += `"${code}","วิชาจำลอง ${code}","${dept}","${facObj.fac}","${section}",${credit},"Lecture","${instructor}","SC${rand(100,999)}","${day}","${timeObj.s}","${timeObj.e}","${midterm_date}","${midTime.s}","${midTime.e}","${final_date}","${finTime.s}","${finTime.e}",${capacity},"",""\n`;
    
    totalRows++;
    if (totalRows >= 500) break; // หยุดเมื่อครบ 500 รายการ
  }
  if (totalRows >= 500) break;
}

// เขียนไฟล์
fs.writeFileSync('courses.csv', csvContent, 'utf8');
console.log(`สร้างไฟล์ courses.csv สำเร็จ! จำนวน ${totalRows} รายการ`);
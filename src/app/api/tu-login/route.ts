import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🟢 ฟังก์ชันช่วยจับคู่หลักสูตรอัตโนมัติ
async function findBestCurriculum(supabaseAdmin: any, username: string, faculty: string, department: string) {
  if (!username || username.length < 2) return null;
  
  const shortYear = parseInt(username.substring(0, 2));
  if (isNaN(shortYear)) return null;
  const entryYear = shortYear + 2500; 

  const { data: curriculums } = await supabaseAdmin
    .from("curriculums")
    .select("*")
    .lte("academic_year", entryYear) 
    .order("academic_year", { ascending: false });

  if (!curriculums || curriculums.length === 0) return null;

  const latestYear = curriculums[0].academic_year;
  const candidates = curriculums.filter((c: any) => c.academic_year === latestYear);

  const bestMatch = candidates.find((c: any) => 
    (department && c.name.includes(department)) || 
    (faculty && c.name.includes(faculty))
  );

  return bestMatch ? bestMatch.id : candidates[0].id;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const tuResponse = await fetch('https://restapi.tu.ac.th/api/v1/auth/Ad/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Application-Key': process.env.TU_APP_SECRET!
      },
      body: JSON.stringify({ UserName: username, PassWord: password })
    });

    const tuData = await tuResponse.json();

    if (tuData.status === true) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
      );

      const syncPassword = `${process.env.TU_SYNC_SECRET}_${tuData.username}`;
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUsers.users.find((u: any) => u.email === tuData.email);

      const autoCurrId = await findBestCurriculum(supabaseAdmin, tuData.username, tuData.faculty, tuData.department);
      
      // 🟢 เปลี่ยนจาก isNewUser เป็น needsCurriculum
      let needsCurriculum = false;

      if (!userExists) {
        // กรณี User ใหม่
        needsCurriculum = true;
        await supabaseAdmin.auth.admin.createUser({
          email: tuData.email,
          password: syncPassword,
          email_confirm: true,
          user_metadata: {
            full_name: tuData.displayname_th,
            faculty: tuData.faculty,
            student_id: tuData.username,
            curriculum_id: autoCurrId 
          }
        });
      } else {
        // 🟢 กรณี User เก่า: เช็คว่ามี curriculum_id ใน metadata หรือยัง
        if (!userExists.user_metadata?.curriculum_id) {
          needsCurriculum = true;
          // อัปเดต Metadata ให้มีค่าที่ระบบเลือกให้เบื้องต้น (เพื่อให้ Frontend นำไปแสดงใน Modal)
          await supabaseAdmin.auth.admin.updateUserById(userExists.id, { 
            user_metadata: { ...userExists.user_metadata, curriculum_id: autoCurrId } 
          });
        }
        
        await supabaseAdmin.auth.admin.updateUserById(userExists.id, { 
          password: syncPassword 
        });
      }

      return NextResponse.json({
        success: true,
        email: tuData.email,
        syncPassword: syncPassword,
        needsCurriculum: needsCurriculum // 🟢 ส่ง flag ตัวใหม่กลับไป
      });

    } else {
      return NextResponse.json({ success: false, message: tuData.message || 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
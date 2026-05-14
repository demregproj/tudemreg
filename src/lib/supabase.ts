import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// สร้างตัวเชื่อมต่อเพื่อส่งออกไปให้หน้าเว็บใช้งาน
export const supabase = createClient(supabaseUrl, supabaseKey)
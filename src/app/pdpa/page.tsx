import Link from "next/link";

export default function PDPAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-2 border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-10 border-b-2 border-gray-100 pb-8">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-4 uppercase text-[#1E0B99]">
            นโยบายความเป็นส่วนตัว <br className="md:hidden" />(Privacy Policy)
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            REGPLANing (DEMREG Project)
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm md:text-base font-medium text-gray-600 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#FBBF24] rounded-full inline-block"></span>
              1. วัตถุประสงค์ของการจัดเก็บข้อมูล
            </h2>
            <p>
              เว็บไซต์ REGPLANing ถูกพัฒนาขึ้นโดยกลุ่มนักศึกษา (DEMREG Project) เพื่อเป็นเครื่องมือช่วยในการจัดตารางเรียนและวางแผนการเรียนสำหรับนักศึกษามหาวิทยาลัยธรรมศาสตร์ 
              ทางผู้พัฒนาจัดเก็บข้อมูลส่วนบุคคลของคุณเพียงเพื่อใช้ในการยืนยันตัวตน และอำนวยความสะดวกในการจัดการข้อมูลแผนการเรียนส่วนบุคคลของคุณภายในเว็บไซต์นี้เท่านั้น
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#FBBF24] rounded-full inline-block"></span>
              2. ข้อมูลส่วนบุคคลที่เราจัดเก็บ
            </h2>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li><strong>ข้อมูลทั่วไป:</strong> ชื่อ-นามสกุล, อีเมล (Email), คณะ และ ภาควิชา</li>
              <li><strong>ข้อมูลการศึกษา:</strong> รหัสชั้นปีที่เข้าศึกษา (เช่น 66, 67) เพื่อใช้ประกอบการคาดเดาหลักสูตรที่เหมาะสมกับคุณ</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> ข้อมูลแผนการเรียน รายวิชาที่เลือก และตารางเรียนที่คุณบันทึกไว้ในระบบ</li>
            </ul>
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-bold text-xs md:text-sm">
              * หมายเหตุ: กรณีเข้าสู่ระบบผ่านบัญชีของมหาวิทยาลัย (TU-Account) รหัสผ่านของท่านจะถูกส่งผ่านระบบ API ของมหาวิทยาลัยโดยตรง ทางผู้พัฒนา <strong>ไม่มีการเข้าถึงและไม่มีการจัดเก็บรหัสผ่าน TU-Account ของท่าน</strong> แต่อย่างใด
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#FBBF24] rounded-full inline-block"></span>
              3. การปกป้องและรักษาความลับของข้อมูล
            </h2>
            <p>
              ข้อมูลทั้งหมดของคุณจะถูกเก็บรักษาไว้ในฐานข้อมูลที่มีความปลอดภัยสูง (Supabase) ทางผู้พัฒนาขอยืนยันว่าจะ <strong>ไม่มีการนำข้อมูลส่วนบุคคลของคุณไปเผยแพร่ ขาย หรือส่งต่อให้แก่บุคคลที่สาม</strong> หรือนำไปใช้เพื่อวัตถุประสงค์อื่นใดนอกเหนือจากการให้บริการบนเว็บไซต์นี้
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#FBBF24] rounded-full inline-block"></span>
              4. สิทธิของเจ้าของข้อมูล
            </h2>
            <p>
              คุณมีสิทธิในการขอเข้าถึง แก้ไข หรือขอลบข้อมูลส่วนบุคคลของคุณออกจากระบบของเราได้ตลอดเวลา หากคุณต้องการยกเลิกการใช้งานและลบข้อมูลทั้งหมด สามารถติดต่อทีมผู้พัฒนาได้โดยตรง
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#FBBF24] rounded-full inline-block"></span>
              5. ข้อมูลการติดต่อ
            </h2>
            <p>
              หากคุณมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวฉบับนี้ หรือต้องการแจ้งปัญหาเกี่ยวกับการจัดการข้อมูล สามารถติดต่อเราได้ที่:
            </p>
            <a href="mailto:demreg.proj@gmail.com" className="text-[#1E0B99] font-black hover:underline mt-2 inline-block text-lg">
              demreg.proj@gmail.com
            </a>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t-2 border-gray-100 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
}
import Link from "next/link";

export default function PDPAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-2 border-gray-100">
        
        {/* 🟢 Header */}
        <div className="text-center mb-10 border-b-2 border-gray-100 pb-8">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-4 uppercase text-[#1E0B99]">
            ข้อตกลงการใช้งาน & นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            REGPLANing (DEMREG Project)
          </p>
        </div>

        {/* 🟢 Content */}
        <div className="space-y-12 text-sm md:text-base font-medium text-gray-600 leading-relaxed">
          
          {/* Section 1: ข้อควรทราบ */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 border-l-4 border-[#FBBF24] pl-4">
              1. ข้อควรทราบก่อนการใช้งาน
            </h2>
            <div className="space-y-5 pl-2 md:pl-4">
              <p>
                <strong className="text-gray-900">1.1.</strong> REGPLANing เป็นเว็บไซต์ที่ทำขึ้นเพื่อใช้ช่วยในการจัดตารางเรียน และวางแผนการเรียนตลอดหลักสูตรให้กับนักศึกษาธรรมศาสตร์ ด้วยฟังก์ชันการเช็คเวลาชนกัน วันสอบชน และเช็ควิชาพื้นฐานความรู้ (prerequisites) เพื่อวางแผนในการเรียนแต่ละเทอมจนจบการศึกษา
              </p>
              <p>
                <strong className="text-gray-900">1.2.</strong> REGPLANing ไม่ได้มีการเชื่อมต่อกับระบบของมหาวิทยาลัย ข้อมูลซึ่งอยู่บนเว็บไซต์เป็นการรวบรวมข้อมูลและอัปเดตด้วยมือโดยทีมงาน
              </p>
              <p>
                <strong className="text-gray-900">1.3.</strong> การจัดตารางและวางแผนการเรียนบน REGPLANing เป็นเพียงการอำนวยความสะดวกให้เห็นภาพมากขึ้นเท่านั้น ไม่ได้ทดแทนการลงทะเบียนเรียนหรือขอโควตา ผู้ใช้จะต้องดำเนินการขอโควตาและลงทะเบียนเรียนผ่านช่องทางของมหาวิทยาลัยตามปกติ <span className="text-red-500 font-bold">*ผู้พัฒนาไม่จำเป็นต้องรับผิดชอบในกรณีที่ผู้ใช้งานไม่ได้ทำการลงทะเบียนเรียนกับมหาวิทยาลัยตามกำหนด*</span>
              </p>
              <p>
                <strong className="text-gray-900">1.4.</strong> ข้อมูลบน REGPLANing เป็นการอัปเดตด้วยมือโดยทีมงานของเรา จึงอาจมีความคลาดเคลื่อนหรือไม่ถูกต้องของข้อมูล โปรดตรวจสอบข้อมูลโดยระมัดระวังอีกครั้งกับทางมหาวิทยาลัย <span className="text-red-500 font-bold">*ผู้พัฒนาไม่จำเป็นต้องรับผิดชอบกรณีที่เกิดความผิดพลาดของข้อมูลและผู้ใช้งานไม่ได้ทำตรวจสอบความถูกต้องของข้อมูล*</span>
              </p>
              <p>
                <strong className="text-gray-900">1.5.</strong> REGPLANing เป็นโปรเจกต์ของนักศึกษาที่พัฒนาขึ้นอย่างไม่เป็นทางการ มีวัตถุประสงค์เพื่ออำนวยความสะดวกในการจัดตารางเรียนและแผนการเรียน ทั้งนี้ REGPLANing ไม่ได้มีส่วนเกี่ยวข้องกับมหาวิทยาลัยธรรมศาสตร์
              </p>
              <p>
                <strong className="text-gray-900">1.6.</strong> การเข้าสู่ระบบ REGPLANing ผ่าน TU-Account หรือรหัส TU-wifi เป็นเพียงการยืนยันตัวตนผ่านระบบ API ของมหาวิทยาลัยเท่านั้น โดยระบบจะไม่เก็บข้อมูลรหัสผ่านของผู้ใช้ ข้อมูลที่รับกลับมาจะถูกใช้เพียงเพื่อสร้างบัญชี (ชื่อ-นามสกุล, คณะ) และค้นหาหลักสูตรที่ผู้ใช้กำลังศึกษา (ผู้ใช้สามารถกดเปลี่ยนหลักสูตรเพื่ออ้างอิงโครงสร้างได้ในภายหลัง)
              </p>
            </div>
          </section>

          {/* Section 2: นโยบายข้อมูลส่วนบุคคล */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 border-l-4 border-[#1E0B99] pl-4">
              2. นโยบายด้านข้อมูลส่วนบุคคล
            </h2>
            <p className="mb-6 pl-2 md:pl-4 text-gray-900 font-bold">
              REGPLANing มีการเก็บข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ในการจัดเก็บและเรียกดูข้อมูลเท่านั้น
            </p>
            <div className="space-y-5 pl-2 md:pl-4">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="mb-2">
                  <strong className="text-[#1E0B99] text-lg">2.1. กรณีเข้าสู่ระบบผ่าน TU-Account</strong>
                </p>
                <p>
                  เราจะไม่เห็นและไม่มีการเก็บข้อมูลรหัสผ่านของผู้ใช้ ข้อมูลจะถูกส่งผ่าน API ของมหาวิทยาลัยเพื่อวัตถุประสงค์ในการยืนยันตัวตนเท่านั้น และข้อมูลที่รับกลับมาเราจะบันทึกชื่อ-นามสกุลและคณะเพื่อสร้างบัญชีผู้ใช้ในฐานข้อมูลของเรา แล้วใช้รหัส 2 หลักแรกของรหัสประจำตัวนักศึกษาในการค้นหาหลักสูตรที่ผู้ใช้กำลังศึกษาโดยเมื่อจบกระบวนการแล้วจะไม่มีการเก็บข้อมูลรหัสนักศึกษาไว้
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="mb-2">
                  <strong className="text-[#1E0B99] text-lg">2.2. กรณีสร้างบัญชีใหม่</strong>
                </p>
                <p>
                  ข้อมูลของท่านจะถูกจัดเก็บโดยปลอดภัย ข้อมูลของผู้ใช้ในฐานข้อมูลของเราจะถูกจัดเก็บไว้อย่างปลอดภัย และจะไม่ถูกใช้เพื่อวัตถุประสงค์อื่นใดนอกจากที่ระบุข้างต้น หากท่านมีข้อสงสัยหรือต้องการยกเลิกการให้ข้อมูลสามารถติดต่อผู้พัฒนาเพื่อทำการจัดการข้อมูลผ่านทางอีเมล <a href="mailto:demreg.proj@gmail.com" className="text-[#FBBF24] font-black hover:underline tracking-tight">demreg.proj@gmail.com</a>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* 🟢 Footer Actions */}
        <div className="mt-16 pt-8 border-t-2 border-gray-100 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
}
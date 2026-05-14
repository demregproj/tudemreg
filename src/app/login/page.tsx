"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // สลับโหมด ล็อกอิน <-> สมัครสมาชิก
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        // โหมดสมัครสมาชิก
        const { error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (error) throw error;
        alert("🎉 สมัครสมาชิกสำเร็จ! (คุณสามารถล็อกอินได้เลย)");
        setIsSignUp(false); // สลับกลับหน้าล็อกอิน
        setPassword("");
      } else {
        // โหมดล็อกอิน
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
        
        // ล็อกอินสำเร็จ เด้งกลับไปหน้าแรก (ตารางเรียน)
        router.push("/");
        router.refresh(); 
      }
    } catch (error: any) {
      setErrorMsg(error.message === "Invalid login credentials" 
        ? "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง" 
        : `❌ ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2.5rem] border-2 border-gray-100 shadow-2xl relative overflow-hidden">
        
        {/* ของตกแต่ง UI พื้นหลัง */}
        <div className="absolute top-0 left-0 w-full h-3 bg-[#1E0B99]"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter drop-shadow-sm mb-2">
            <span className="text-[#FBBF24]">TUDEM</span>
            <span className="text-[#1E0B99]">REG</span>
            <span className="text-[#4ADE80] ml-1">✓</span>
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {isSignUp ? "Create new account" : "Welcome back, Student"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" 
              required
              placeholder="student@dome.tu.ac.th" 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#1E0B99] focus:bg-white outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              minLength={6}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#1E0B99] focus:bg-white outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-white font-black text-lg rounded-2xl shadow-lg transition-all mt-4 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1E0B99] hover:bg-blue-900 shadow-blue-200/50'
            }`}
          >
            {loading ? "กำลังโหลด..." : (isSignUp ? "สมัครสมาชิก" : "เข้าสู่ระบบ")}
          </button>
        </form>

        <div className="mt-8 text-center border-t-2 border-gray-50 pt-6">
          <p className="text-sm font-bold text-gray-500">
            {isSignUp ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชีใช่ไหม?"}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
              }}
              className="ml-2 text-[#1E0B99] hover:underline transition-all"
            >
              {isSignUp ? "เข้าสู่ระบบเลย" : "สมัครสมาชิก"}
            </button>
          </p>
        </div>

        {/* ปุ่มกลับหน้าแรก (เผื่ออยากกดกลับไปดูตารางโดยไม่ล็อกอิน) */}
        <div className="mt-4 text-center">
           <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors">
              ← กลับไปหน้าจัดตารางเรียน
           </Link>
        </div>

      </div>
    </div>
  );
}
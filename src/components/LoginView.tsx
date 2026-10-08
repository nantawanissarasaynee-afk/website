import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Ambulance,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Hospital,
  KeyRound,
  Lock,
  LogIn,
  RotateCw,
  ShieldAlert,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { ShiftRecord, SystemSettings, User } from '../types';

interface LoginViewProps {
  settings: SystemSettings;
  users: User[];
  shiftRecords: ShiftRecord[];
  onLoginSuccess: (user: User) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  settings,
  users,
  shiftRecords,
  onLoginSuccess,
  onOpenAlert,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'ทั้งหมด' | 'เช้า' | 'บ่าย' | 'ดึก'>('ทั้งหมด');

  // Filter shifts
  const filteredShifts = selectedShiftFilter === 'ทั้งหมด'
    ? shiftRecords
    : shiftRecords.filter((s) => s.shift === selectedShiftFilter);

  // Calculate totals
  const totalServices = filteredShifts.reduce((acc, s) => acc + s.totalService, 0);
  const totalR = filteredShifts.reduce((acc, s) => acc + s.R, 0);
  const totalE = filteredShifts.reduce((acc, s) => acc + s.E, 0);
  const totalU = filteredShifts.reduce((acc, s) => acc + s.U, 0);
  const totalS = filteredShifts.reduce((acc, s) => acc + s.S, 0);
  const totalN = filteredShifts.reduce((acc, s) => acc + s.N, 0);

  const totalRefer = filteredShifts.reduce((acc, s) => acc + s.refer, 0);
  const totalGeneralCheckup = filteredShifts.reduce((acc, s) => acc + s.generalCheckup, 0);
  const totalAccident = filteredShifts.reduce((acc, s) => acc + s.trafficAccident + s.generalAccident, 0);
  const totalCPR = filteredShifts.reduce((acc, s) => acc + s.cpr, 0);
  const totalDead = filteredShifts.reduce((acc, s) => acc + s.dead, 0);
  const totalAdmit = filteredShifts.reduce((acc, s) => acc + s.admit, 0);
  const totalOthers = filteredShifts.reduce((acc, s) => acc + s.otherServices, 0);

  const totalUnderTriage = filteredShifts.reduce((acc, s) => acc + s.underTriage, 0);
  const totalOverTriage = filteredShifts.reduce((acc, s) => acc + s.overTriage, 0);

  // Shift counts
  const morningCases = shiftRecords.filter((s) => s.shift === 'เช้า').reduce((acc, s) => acc + s.totalService, 0);
  const afternoonCases = shiftRecords.filter((s) => s.shift === 'บ่าย').reduce((acc, s) => acc + s.totalService, 0);
  const nightCases = shiftRecords.filter((s) => s.shift === 'ดึก').reduce((acc, s) => acc + s.totalService, 0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onOpenAlert('กรุณากรอกข้อมูล', 'โปรดระบุชื่อผู้ใช้งานและรหัสผ่านเพื่อเข้าสู่ระบบ', 'warning');
      return;
    }

    setIsLoading(true);

    // Simulate authentication process with loading spinner
    setTimeout(() => {
      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password.trim()
      );

      setIsLoading(false);

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        onOpenAlert('เข้าสู่ระบบไม่สำเร็จ', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ทดสอบ: admin / admin123 หรือ nurse1 / nurse123)', 'error');
      }
    }, 600);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      {/* Top hospital branding header */}
      <header className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-200/80 mb-4 sm:mb-6">
        <div className="flex items-center gap-3.5">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-14 h-14 object-contain rounded-2xl shadow-sm bg-white p-1 border border-teal-100"
            />
          ) : (
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0C7C82] to-[#35B4B0] text-white flex items-center justify-center shadow-md shadow-teal-700/20">
              <Hospital className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-teal-100 text-[#0C7C82] rounded-full border border-teal-200/60">
                ระบบงานอุบัติเหตุฉุกเฉินและนิติเวช
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Realtime
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {settings.hospitalName} <span className="text-[#0C7C82]">{settings.departmentName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {settings.affiliation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <Clock className="w-4 h-4 text-[#35B4B0]" />
          <span>เวลาปัจจุบัน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })}</span>
        </div>
      </header>

      {/* Main Container - Card เข้าระบบแนวนอน */}
      <main className="max-w-7xl w-full mx-auto my-auto py-2">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          
          {/* Left Column (Realtime ER Monitor & Stats) - 7 cols */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50/60 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/70">
            <div>
              {/* Header of realtime section */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#0C7C82]" />
                    สถิติผู้ป่วยมารับบริการแบบ Realtime
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ข้อมูลสะสมเวรประจำวัน รพ.หลวงพ่อเปิ่น
                  </p>
                </div>

                {/* Shift Selector Filter */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  {(['ทั้งหมด', 'เช้า', 'บ่าย', 'ดึก'] as const).map((shift) => (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => setSelectedShiftFilter(shift)}
                      className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                        selectedShiftFilter === shift
                          ? 'bg-[#0C7C82] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {shift === 'ทั้งหมด' ? 'ทุกเวร' : `เวร${shift}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Shifts Highlights */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-center transition hover:shadow-xs">
                  <span className="text-[11px] font-semibold text-sky-700 block">เวรเช้า (08:00-16:00)</span>
                  <span className="text-2xl font-black text-sky-900">{morningCases}</span>
                  <span className="text-[10px] text-sky-600 block">ราย</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-center transition hover:shadow-xs">
                  <span className="text-[11px] font-semibold text-amber-700 block">เวรบ่าย (16:00-24:00)</span>
                  <span className="text-2xl font-black text-amber-900">{afternoonCases}</span>
                  <span className="text-[10px] text-amber-600 block">ราย</span>
                </div>
                <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 text-center transition hover:shadow-xs">
                  <span className="text-[11px] font-semibold text-purple-700 block">เวรดึก (24:00-08:00)</span>
                  <span className="text-2xl font-black text-purple-900">{nightCases}</span>
                  <span className="text-[10px] text-purple-600 block">ราย</span>
                </div>
              </div>

              {/* 5-Level Triage Bar */}
              <div className="mb-5 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />
                    การคัดกรองผู้ป่วย 5 ระดับ (Triage 5-Level)
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    รวม {totalServices} ราย
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  <div className="bg-red-50 border border-red-200/60 rounded-xl p-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-[#D32F2F] block">R (วิกฤต)</span>
                    <span className="text-lg font-black text-slate-800">{totalR}</span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200/60 rounded-xl p-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F57C00] mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-[#F57C00] block">E (ฉุกเฉิน)</span>
                    <span className="text-lg font-black text-slate-800">{totalE}</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200/60 rounded-xl p-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FBC02D] mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-[#F57C00] block">U (เร่งด่วน)</span>
                    <span className="text-lg font-black text-slate-800">{totalU}</span>
                  </div>
                  <div className="bg-lime-50 border border-lime-200/60 rounded-xl p-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#AED581] mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-lime-700 block">S (ด่วนปานกลาง)</span>
                    <span className="text-lg font-black text-slate-800">{totalS}</span>
                  </div>
                  <div className="bg-teal-50 border border-teal-200/60 rounded-xl p-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#26A69A] mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-teal-700 block">N (ไม่ด่วน)</span>
                    <span className="text-lg font-black text-slate-800">{totalN}</span>
                  </div>
                </div>
              </div>

              {/* Service Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">ส่งต่อ (Refer)</span>
                  <span className="text-lg font-bold text-[#0288D1]">{totalRefer}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">ตรวจโรคทั่วไป</span>
                  <span className="text-lg font-bold text-[#26A69A]">{totalGeneralCheckup}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">อุบัติเหตุ (จราจร/ทั่วไป)</span>
                  <span className="text-lg font-bold text-[#FF8A65]">{totalAccident}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">นอน รพ. (Admit)</span>
                  <span className="text-lg font-bold text-[#35B4B0]">{totalAdmit}</span>
                </div>
              </div>

              {/* Critical outcomes & Quality Triage Indicators */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-semibold text-rose-800">CPR / ROSC</span>
                  </div>
                  <span className="text-sm font-black text-rose-700">{totalCPR}</span>
                </div>

                <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">เสียชีวิต (Dead)</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{totalDead}</span>
                </div>

                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-800">บริการอื่นๆ (แผล/ฉีด)</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">{totalOthers}</span>
                </div>
              </div>
            </div>

            {/* Quality metric banner (Under/Over Triage) */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-amber-50/50 p-2 rounded-xl border border-amber-200/50">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                ดัชนีคุณภาพตลอดทั้งวัน:
              </span>
              <div className="flex items-center gap-3">
                <span className="text-amber-800">Under Triage: <strong>{totalUnderTriage}</strong> ราย</span>
                <span className="text-blue-800">Over Triage: <strong>{totalOverTriage}</strong> ราย</span>
              </div>
            </div>
          </div>

          {/* Right Column (Horizontal Login Form) - 5 cols */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0C7C82] border border-teal-200/70 mb-2">
                  ยินดีต้อนรับเข้าสู่ระบบ
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  ลงชื่อเข้าใช้งาน
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  สำหรับผู้ดูแลระบบ แพทย์ และพยาบาลวิชาชีพ (ระบบจะตรวจสอบสิทธิ์อัตโนมัติจากชื่อผู้ใช้)
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="เช่น admin หรือ nurse1"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0C7C82] focus:bg-white transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0C7C82] focus:bg-white transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#0C7C82' }}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg shadow-teal-900/20 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>กำลังตรวจสอบข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>เข้าสู่ระบบ (Sign In)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick test accounts helper */}
              <div className="mt-6 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1.5">บัญชีทดสอบระบบรวดเร็ว:</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin', 'admin123')}
                    className="flex items-center justify-between text-left p-1.5 rounded-lg hover:bg-white transition border border-transparent hover:border-slate-200 cursor-pointer"
                  >
                    <span className="font-semibold text-[#0C7C82]">👑 ผู้ดูแลระบบ (Admin)</span>
                    <span className="text-slate-500 font-mono">admin / admin123</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('nurse1', 'nurse123')}
                    className="flex items-center justify-between text-left p-1.5 rounded-lg hover:bg-white transition border border-transparent hover:border-slate-200 cursor-pointer"
                  >
                    <span className="font-semibold text-[#26A69A]">👩‍⚕️ พยาบาลวิชาชีพ (Nurse)</span>
                    <span className="text-slate-500 font-mono">nurse1 / nurse123</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{settings.hospitalName}</span>
              <span>เวอร์ชัน 2.5 (2026)</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center py-2 text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.hospitalName} {settings.departmentName} {settings.affiliation}
      </footer>
    </div>
  );
};

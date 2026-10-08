import React from 'react';
import {
  Bell,
  Clock,
  HeartPulse,
  Hospital,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { ShiftType, SystemSettings, User } from '../types';

interface HeaderProps {
  settings: SystemSettings;
  currentUser: User;
  onOpenMobileMenu: () => void;
  onLogoutConfirm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentUser,
  onOpenMobileMenu,
  onLogoutConfirm,
}) => {
  // Determine current duty shift from time
  const getAutoShift = (): { shift: ShiftType; label: string } => {
    const hours = new Date().getHours();
    if (hours >= 8 && hours < 16) {
      return { shift: 'เช้า', label: 'เวรเช้า (08:00 - 16:00)' };
    } else if (hours >= 16 && hours < 24) {
      return { shift: 'บ่าย', label: 'เวรบ่าย (16:00 - 24:00)' };
    } else {
      return { shift: 'ดึก', label: 'เวรดึก (24:00 - 08:00)' };
    }
  };

  const currentDuty = getAutoShift();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile menu button + Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-9 h-9 object-contain rounded-xl border border-slate-200 p-0.5"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: '#0C7C82' }}
            >
              <Hospital className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                {settings.hospitalName}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0C7C82] border border-teal-200">
                {settings.departmentName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {settings.affiliation}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Duty Shift Badge & User Controls */}
      <div className="flex items-center gap-3">
        {/* Realtime Duty Shift Badge */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">ผลัดปัจจุบัน:</span>
          <span className="text-xs font-bold text-[#0C7C82]">{currentDuty.label}</span>
        </div>

        {/* User Pill Button */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-900 line-clamp-1">
              {currentUser.fullName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {currentUser.role === 'admin' ? '👑 ผู้ดูแลระบบ' : '👩‍⚕️ พยาบาลวิชาชีพ'}
            </span>
          </div>

          <button
            onClick={onLogoutConfirm}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

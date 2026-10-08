import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  CheckSquare,
  ClipboardList,
  FileSpreadsheet,
  Home,
  Hospital,
  Layers,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

interface MobileShortcutBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isAdmin: boolean;
}

export const MobileShortcutBar: React.FC<MobileShortcutBarProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
}) => {
  // iPhone style vibrant rounded-squircle app icons
  const shortcuts = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ด',
      icon: Activity,
      gradient: 'from-[#0C7C82] to-[#35B4B0]',
      shadow: 'shadow-teal-500/20',
    },
    {
      id: 'patients',
      label: 'จัดการผู้ป่วย/เวร',
      icon: Layers,
      gradient: 'from-[#35B4B0] to-[#26A69A]',
      shadow: 'shadow-emerald-500/20',
    },
    {
      id: 'search',
      label: 'ค้นหาผู้รับบริการ',
      icon: Search,
      gradient: 'from-[#0288D1] to-[#00BCD4]',
      shadow: 'shadow-sky-500/20',
    },
    {
      id: 'assignments',
      label: 'มอบหมายงาน',
      icon: ClipboardList,
      gradient: 'from-[#F57C00] to-[#FF8A65]',
      shadow: 'shadow-orange-500/20',
    },
    {
      id: 'grading',
      label: 'ตรวจการส่งงาน',
      icon: CheckSquare,
      gradient: 'from-[#4A2C6D] to-[#7B1FA2]',
      shadow: 'shadow-purple-500/20',
    },
    ...(isAdmin
      ? [
          {
            id: 'users',
            label: 'จัดการผู้ใช้',
            icon: Users,
            gradient: 'from-[#26A69A] to-[#80CBC4]',
            shadow: 'shadow-teal-500/20',
          },
          {
            id: 'settings',
            label: 'ตั้งค่าระบบ',
            icon: Settings,
            gradient: 'from-[#455A64] to-[#78909C]',
            shadow: 'shadow-slate-500/20',
          },
        ]
      : []),
  ];

  const bottomNavItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
    { id: 'patients', label: 'ผู้ป่วย & เวร', icon: Layers },
    { id: 'search', label: 'ค้นหา', icon: Search },
    { id: 'assignments', label: 'งาน', icon: ClipboardList },
    { id: 'grading', label: 'ตรวจงาน', icon: CheckSquare },
  ];

  return (
    <>
      {/* iOS App Icon Grid (Shown only on mobile/tablet screens < lg) */}
      <div className="block lg:hidden bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0C7C82]" />
            เมนูทางลัด (Mobile Quick Apps)
          </span>
          <span className="text-[10px] text-slate-400">iOS Style</span>
        </div>

        {/* Squircle App Icons */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 text-center">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition"
              >
                <div
                  className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white shadow-md ${item.shadow} transition-transform group-hover:scale-105 ${
                    isActive ? 'ring-3 ring-[#0C7C82] ring-offset-2' : ''
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className={`text-[11px] font-semibold tracking-tight leading-tight line-clamp-1 ${
                  isActive ? 'text-[#0C7C82] font-bold' : 'text-slate-700'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Navigation Bar (Visible only on mobile screens < lg) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-2 px-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition ${
                  isActive ? 'text-[#0C7C82] font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0C7C82]" />}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

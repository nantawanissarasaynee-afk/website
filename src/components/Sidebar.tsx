import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  Hospital,
  Layers,
  LogOut,
  Search,
  Settings,
  Shield,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { SystemSettings, User } from '../types';

interface SidebarProps {
  settings: SystemSettings;
  currentUser: User;
  currentTab: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectTab: (tab: string) => void;
  onLogoutConfirm: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  currentUser,
  currentTab,
  isOpenMobile,
  onCloseMobile,
  onSelectTab,
  onLogoutConfirm,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ดสรุปงาน',
      sub: 'สถิติ Realtime & ชาร์ต',
      icon: Activity,
      color: '#0C7C82',
    },
    {
      id: 'patients',
      label: 'จัดการผู้ป่วย & เวร',
      sub: 'บันทึกสถิติและเคส',
      icon: Layers,
      color: '#35B4B0',
    },
    {
      id: 'search',
      label: 'ค้นหาผู้รับบริการ',
      sub: 'สืบค้น Triage & ตรวจโรค',
      icon: Search,
      color: '#0288D1',
    },
    {
      id: 'assignments',
      label: 'มอบหมายงาน',
      sub: 'ภารกิจ & เกณฑ์คะแนน',
      icon: BookOpen,
      color: '#F57C00',
    },
    {
      id: 'grading',
      label: 'ตรวจการส่งงาน',
      sub: 'ประเมินผล & ให้คะแนน',
      icon: CheckSquare,
      color: '#4A2C6D',
    },
    ...(isAdmin
      ? [
          {
            id: 'users',
            label: 'จัดการผู้ใช้งาน',
            sub: 'สิทธิ์ระบบ & Excel',
            icon: Users,
            color: '#26A69A',
          },
          {
            id: 'settings',
            label: 'ตั้งค่าระบบ',
            sub: 'ชื่อรพ. & Triage',
            icon: Settings,
            color: '#607D8B',
          },
        ]
      : []),
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar drawer container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-10 h-10 object-contain rounded-xl border border-slate-100 shadow-xs"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md"
                style={{ backgroundColor: '#0C7C82' }}
              >
                <Hospital className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                {settings.hospitalName}
              </h2>
              <p className="text-[10px] text-[#0C7C82] font-semibold mt-0.5">
                {settings.departmentName}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            เมนูหลัก (Navigation)
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#0C7C82] text-white shadow-md shadow-teal-900/15 font-bold'
                    : 'text-slate-700 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                  style={!isActive ? { color: item.color } : {}}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs leading-none">{item.label}</div>
                  <div
                    className={`text-[10px] mt-1 truncate ${
                      isActive ? 'text-teal-100 opacity-90' : 'text-slate-400'
                    }`}
                  >
                    {item.sub}
                  </div>
                </div>
                {isActive && <div className="w-1.5 h-4 rounded-full bg-white/70" />}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                isAdmin ? 'bg-purple-100 text-[#4A2C6D]' : 'bg-teal-100 text-[#0C7C82]'
              }`}
            >
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-slate-800 truncate">
                {currentUser.fullName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0C7C82]">
                <Shield className="w-2.5 h-2.5" />
                {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'พยาบาลวิชาชีพ'}
              </span>
            </div>
          </div>

          <button
            onClick={onLogoutConfirm}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};

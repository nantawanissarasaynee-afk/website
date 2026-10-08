/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { initialAssignments, initialPatients, initialSettings, initialShiftRecords, initialSubmissions, initialUsers } from './data/initialData';
import { Assignment, PatientRecord, ShiftRecord, Submission, SystemSettings, User } from './types';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileShortcutBar } from './components/MobileShortcutBar';
import { DashboardView } from './components/DashboardView';
import { PatientManagementView } from './components/PatientManagementView';
import { PatientSearchView } from './components/PatientSearchView';
import { AssignmentView } from './components/AssignmentView';
import { SubmissionGradeView } from './components/SubmissionGradeView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { AlertType, SweetAlertModal } from './components/SweetAlert';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Local storage state keys
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('er_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('er_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [shiftRecords, setShiftRecords] = useState<ShiftRecord[]>(() => {
    const saved = localStorage.getItem('er_shift_records');
    return saved ? JSON.parse(saved) : initialShiftRecords;
  });

  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    const saved = localStorage.getItem('er_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('er_assignments');
    return saved ? JSON.parse(saved) : initialAssignments;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('er_submissions');
    return saved ? JSON.parse(saved) : initialSubmissions;
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('er_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Mobile sidebar drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lazy / Skeleton loading simulation when switching views
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Sweet Alert & Confirm Modal state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('er_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('er_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('er_shift_records', JSON.stringify(shiftRecords));
  }, [shiftRecords]);

  useEffect(() => {
    localStorage.setItem('er_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('er_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('er_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Handle Tab Switch with subtle smooth lazy loading effect
  const handleSelectTab = (tab: string) => {
    if (tab === currentTab) return;
    setIsTabLoading(true);
    setCurrentTab(tab);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 200);
  };

  // Helper for opening simple alert
  const openAlert = (
    title: string,
    message: string,
    type: AlertType = 'info'
  ) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      showCancel: false,
      confirmText: 'ตกลง',
      onConfirm: () => setAlertConfig((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // Helper for opening confirm action dialog (Sweet Confirm)
  const confirmAction = (title: string, message: string, action: () => void) => {
    setAlertConfig({
      isOpen: true,
      type: 'warning',
      title,
      message,
      showCancel: true,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        action();
      },
      onCancel: () => setAlertConfig((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('er_current_user', JSON.stringify(user));
    openAlert('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${user.fullName} (${user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พยาบาลวิชาชีพ'})`, 'success');
  };

  // Logout handler with Sweet Confirm
  const handleLogoutConfirm = () => {
    confirmAction(
      'ออกจากระบบ (Logout)',
      'คุณต้องการออกจากระบบงานอุบัติเหตุฉุกเฉินและนิติเวช ใช่หรือไม่?',
      () => {
        setCurrentUser(null);
        sessionStorage.removeItem('er_current_user');
        setCurrentTab('dashboard');
      }
    );
  };

  // If not logged in, show the comprehensive horizontal login view
  if (!currentUser) {
    return (
      <div className="font-['Sarabun',sans-serif]">
        <LoginView
          settings={settings}
          users={users}
          shiftRecords={shiftRecords}
          onLoginSuccess={handleLoginSuccess}
          onOpenAlert={openAlert}
        />
        <SweetAlertModal
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          showCancel={alertConfig.showCancel}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
        />
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 font-['Sarabun',sans-serif] text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        settings={settings}
        currentUser={currentUser}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onLogoutConfirm={handleLogoutConfirm}
      />

      <div className="flex-1 flex">
        {/* Left Desktop & Mobile Sidebar Drawer */}
        <Sidebar
          settings={settings}
          currentUser={currentUser}
          currentTab={currentTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onSelectTab={handleSelectTab}
          onLogoutConfirm={handleLogoutConfirm}
        />

        {/* Main Content Area (offset left by sidebar width on desktop) */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0 pb-20 lg:pb-8">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {/* Mobile iOS Shortcut App Grid (Only on screen < lg) */}
            <MobileShortcutBar
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              isAdmin={isAdmin}
            />

            {/* Skeleton / Lazy loading spinner */}
            {isTabLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0C7C82] animate-spin" />
                <span className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <>
                {currentTab === 'dashboard' && (
                  <DashboardView
                    settings={settings}
                    shiftRecords={shiftRecords}
                    patients={patients}
                    onNavigateTab={handleSelectTab}
                    onOpenAlert={openAlert}
                  />
                )}

                {currentTab === 'patients' && (
                  <PatientManagementView
                    settings={settings}
                    patients={patients}
                    shiftRecords={shiftRecords}
                    onUpdatePatients={setPatients}
                    onUpdateShiftRecords={setShiftRecords}
                    onOpenAlert={openAlert}
                    onConfirmAction={confirmAction}
                  />
                )}

                {currentTab === 'search' && (
                  <PatientSearchView
                    settings={settings}
                    patients={patients}
                    onUpdatePatients={setPatients}
                    onOpenAlert={openAlert}
                    onConfirmAction={confirmAction}
                  />
                )}

                {currentTab === 'assignments' && (
                  <AssignmentView
                    assignments={assignments}
                    onUpdateAssignments={setAssignments}
                    onOpenAlert={openAlert}
                    onConfirmAction={confirmAction}
                  />
                )}

                {currentTab === 'grading' && (
                  <SubmissionGradeView
                    submissions={submissions}
                    onUpdateSubmissions={setSubmissions}
                    onOpenAlert={openAlert}
                  />
                )}

                {currentTab === 'users' && isAdmin && (
                  <UserManagementView
                    users={users}
                    currentUserId={currentUser.id}
                    onUpdateUsers={setUsers}
                    onOpenAlert={openAlert}
                    onConfirmAction={confirmAction}
                  />
                )}

                {currentTab === 'settings' && isAdmin && (
                  <SettingsView
                    settings={settings}
                    onUpdateSettings={setSettings}
                    onOpenAlert={openAlert}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Global Sweet Alert / Sweet Confirm Modal */}
      <SweetAlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </div>
  );
}

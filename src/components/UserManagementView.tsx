import React, { useState } from 'react';
import {
  Download,
  Edit2,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { downloadUserTemplate, exportToCSV, exportToXLSX, parseExcelOrCSV } from '../utils/excel';

interface UserManagementViewProps {
  users: User[];
  currentUserId: string;
  onUpdateUsers: (users: User[]) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onConfirmAction: (title: string, message: string, action: () => void) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUserId,
  onUpdateUsers,
  onOpenAlert,
  onConfirmAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ทั้งหมด');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'nurse' as UserRole, // 'admin' | 'nurse' | 'user'
    department: 'งานการพยาบาลอุบัติเหตุฉุกเฉิน',
    phone: '',
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      username: '',
      password: '',
      fullName: '',
      role: 'nurse',
      department: 'งานการพยาบาลอุบัติเหตุฉุกเฉิน',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: user.password || '',
      fullName: user.fullName,
      role: user.role,
      department: user.department || 'งานการพยาบาลอุบัติเหตุฉุกเฉิน',
      phone: user.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.fullName.trim()) {
      onOpenAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุ Username และชื่อ-นามสกุล', 'warning');
      return;
    }

    if (!editingUser && !form.password.trim()) {
      onOpenAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุรหัสผ่านสำหรับผู้ใช้ใหม่', 'warning');
      return;
    }

    // Check duplicate username
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === form.username.trim().toLowerCase() &&
        u.id !== editingUser?.id
    );
    if (exists) {
      onOpenAlert('ชื่อผู้ใช้ซ้ำ', `ชื่อผู้ใช้ "${form.username}" มีอยู่ในระบบแล้ว`, 'error');
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              ...form,
              password: form.password ? form.password : u.password,
            }
          : u
      );
      onUpdateUsers(updated);
      onOpenAlert('แก้ไขสำเร็จ', 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว', 'success');
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role,
        department: form.department,
        phone: form.phone,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onUpdateUsers([newUser, ...users]);
      onOpenAlert('เพิ่มสำเร็จ', 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUserId) {
      onOpenAlert('ไม่อนุญาต', 'ไม่สามารถลบบัญชีผู้ใช้ที่กำลังเข้าใช้งานอยู่ได้', 'warning');
      return;
    }

    onConfirmAction('ยืนยันการลบผู้ใช้', `คุณแน่ใจว่าต้องการลบผู้ใช้ "${user.fullName}" (${user.username})?`, () => {
      onUpdateUsers(users.filter((u) => u.id !== user.id));
      onOpenAlert('ลบสำเร็จ', 'ลบผู้ใช้เรียบร้อยแล้ว', 'success');
    });
  };

  // Import Excel for Users
  const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await parseExcelOrCSV(file);
      if (!rows || rows.length === 0) {
        onOpenAlert('ไฟล์ว่างเปล่า', 'ไม่พบข้อมูลในไฟล์ที่เลือก', 'warning');
        return;
      }

      const imported: User[] = rows.map((r: any, idx: number) => {
        const roleText = String(r['role'] || r['บทบาท'] || 'ผู้ใช้งาน');
        const role: UserRole = roleText.includes('ผู้ดูแล') || roleText.toLowerCase() === 'admin' ? 'admin' : 'nurse';

        return {
          id: `u-import-${Date.now()}-${idx}`,
          username: String(r['username'] || r['ชื่อผู้ใช้'] || `user_${idx}`),
          password: String(r['password'] || r['รหัสผ่าน'] || '123456'),
          fullName: String(r['fullName'] || r['ชื่อ-นามสกุล'] || 'เจ้าหน้าที่'),
          role,
          department: String(r['department'] || r['กลุ่มงาน'] || 'งานการพยาบาลอุบัติเหตุฉุกเฉิน'),
          phone: String(r['phone'] || r['เบอร์โทร'] || ''),
          createdAt: new Date().toISOString().slice(0, 10),
        };
      });

      onUpdateUsers([...imported, ...users]);
      onOpenAlert('นำเข้าสำเร็จ', `นำเข้าผู้ใช้งานใหม่สำเร็จจำนวน ${imported.length} ท่าน (รองรับภาษาไทย UTF-8)`, 'success');
    } catch (err) {
      onOpenAlert('ข้อผิดพลาด', 'ไม่สามารถนำเข้าข้อมูลผู้ใช้ได้ กรุณาตรวจสอบไฟล์', 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Export Users
  const handleExportUsersXLSX = () => {
    const exportData = users.map((u) => ({
      'username': u.username,
      'fullName': u.fullName,
      'role': u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน',
      'department': u.department || '',
      'phone': u.phone || '',
      'createdAt': u.createdAt,
    }));
    exportToXLSX(exportData, `Users_List_${new Date().toISOString().slice(0, 10)}`, 'รายชื่อผู้ใช้');
    onOpenAlert('ส่งออกสำเร็จ', 'ดาวน์โหลดไฟล์รายชื่อผู้ใช้สำเร็จ', 'success');
  };

  const handleExportUsersCSV = () => {
    const exportData = users.map((u) => ({
      'username': u.username,
      'fullName': u.fullName,
      'role': u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน',
      'department': u.department || '',
      'phone': u.phone || '',
    }));
    exportToCSV(exportData, `Users_List_UTF8_${new Date().toISOString().slice(0, 10)}`);
    onOpenAlert('ส่งออกสำเร็จ', 'ดาวน์โหลดไฟล์ CSV (UTF-8 BOM ภาษาไทย) เรียบร้อยแล้ว', 'success');
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'admin' && u.role !== 'admin') return false;
    if (roleFilter === 'nurse' && u.role === 'admin') return false;
    if (
      searchQuery &&
      !u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0C7C82]" />
            เมนูจัดการผู้ใช้งาน (User Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดสิทธิ์การเข้าใช้งาน (ผู้ดูแลระบบ, ผู้ใช้งาน/พยาบาล) พร้อมระบบนำเข้า/ส่งออก Excel ภาษาไทย
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Template */}
          <button
            onClick={downloadUserTemplate}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
            title="ดาวน์โหลดเทมเพลต"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template Excel</span>
          </button>

          {/* Import */}
          <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>นำเข้า Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportUsers}
              className="hidden"
            />
          </label>

          {/* Export */}
          <button
            onClick={handleExportUsersXLSX}
            className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-xl border border-sky-200 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
            <span>ส่งออก Excel</span>
          </button>

          {/* Add */}
          <button
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#0C7C82' }}
            className="px-4 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งาน</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้ หรือ ชื่อ-นามสกุล..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0C7C82]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">บทบาท:</span>
          {(['ทั้งหมด', 'admin', 'nurse'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                roleFilter === r
                  ? 'bg-[#0C7C82] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ทั้งหมด' ? 'ทั้งหมด' : r === 'admin' ? '👑 ผู้ดูแลระบบ' : '👩‍⚕️ ผู้ใช้งาน/พยาบาล'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table with Horizontal Overflow */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            จำนวนผู้ใช้งานในระบบ: <strong>{filteredUsers.length}</strong> ท่าน
          </span>
          <span className="text-xs text-slate-400">รองรับภาษาไทย UTF-8</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ชื่อผู้ใช้ (Username)</th>
                <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3">บทบาท (Role)</th>
                <th className="py-3 px-3">กลุ่มงาน / แผนก</th>
                <th className="py-3 px-3">เบอร์ติดต่อ</th>
                <th className="py-3 px-3">วันที่สร้าง</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold font-mono text-slate-900">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-[#4A2C6D]'
                              : 'bg-teal-100 text-[#0C7C82]'
                          }`}
                        >
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                        {user.id === currentUserId && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                            คุณ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {user.fullName}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-[#4A2C6D] border border-purple-200'
                            : 'bg-teal-50 text-[#0C7C82] border border-teal-200'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span>ผู้ดูแลระบบ</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>ผู้ใช้งาน (พยาบาล)</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {user.department || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {user.phone || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {user.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-[#0C7C82] hover:bg-teal-50 rounded-lg transition"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={user.id === currentUserId}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:hover:text-slate-400"
                          title={user.id === currentUserId ? 'ไม่สามารถลบบัญชีของตนเองได้' : 'ลบ'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal with Radio Roles */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-sweet-pop border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0C7C82]" />
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="เช่น nurse2, admin_er"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password) {editingUser && '(เว้นว่างหากไม่ต้องการเปลี่ยน)'} *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (พร้อมคำนำหน้า) *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="เช่น พว. วิภาดา ศรีสะอาด"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Radio บทบาท (ผู้ดูแลระบบ, ผู้ใช้งาน) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  บทบาทและระดับสิทธิ์การใช้งาน (Role) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      form.role === 'admin'
                        ? 'border-[#0C7C82] bg-teal-50/50 text-[#0C7C82]'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={form.role === 'admin'}
                      onChange={() => setForm({ ...form, role: 'admin' })}
                      className="accent-[#0C7C82]"
                    />
                    <div>
                      <span className="block text-xs font-bold">ผู้ดูแลระบบ</span>
                      <span className="block text-[10px] text-slate-500">สิทธิ์เต็มทุกเมนู</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      form.role === 'nurse' || form.role === 'user'
                        ? 'border-[#0C7C82] bg-teal-50/50 text-[#0C7C82]'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="nurse"
                      checked={form.role === 'nurse' || form.role === 'user'}
                      onChange={() => setForm({ ...form, role: 'nurse' })}
                      className="accent-[#0C7C82]"
                    />
                    <div>
                      <span className="block text-xs font-bold">ผู้ใช้งาน</span>
                      <span className="block text-[10px] text-slate-500">พยาบาล / เจ้าหน้าที่</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">กลุ่มงาน</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="081-xxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#0C7C82' }}
                  className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-sm"
                >
                  บันทึกข้อมูลผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

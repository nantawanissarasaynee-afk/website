import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Palette,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Assignment } from '../types';

interface AssignmentViewProps {
  assignments: Assignment[];
  onUpdateAssignments: (assignments: Assignment[]) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onConfirmAction: (title: string, message: string, action: () => void) => void;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({
  assignments,
  onUpdateAssignments,
  onOpenAlert,
  onConfirmAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ทั้งหมด');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const [form, setForm] = useState({
    title: '',
    subject: 'การบริหารจัดการคุณภาพ ER',
    educationLevel: 'พยาบาลวิชาชีพเวร ER',
    classroom: 'ห้องอุบัติเหตุฉุกเฉิน ผลัดที่ 1-3',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    dueTime: '16:00',
    description: '',
    maxScore: 100,
    tagColor: '#0C7C82',
  });

  const subjectsList = [
    'การบริหารจัดการคุณภาพ ER',
    'การกู้ชีพขั้นสูงและ CPR',
    'นิติเวชศาสตร์และการพยาบาลกฎหมาย',
    'การคัดกรองผู้ป่วยฉุกเฉิน ESI Triage',
    'การดูแลผู้บาดเจ็บฉุกเฉิน Trauma Care',
    'Fast Track STEMI & Stroke',
  ];

  const educationLevelsList = [
    'พยาบาลวิชาชีพเวร ER',
    'พยาบาลบรรจุใหม่ & เจ้าหน้าที่กู้ชีพ',
    'พยาบาลเวรนิติเวช',
    'เจ้าหน้าที่เวชกิจฉุกเฉิน (EMT)',
    'นักศึกษาพยาบาลฝึกปฏิบัติงาน',
  ];

  const classroomList = [
    'ห้องอุบัติเหตุฉุกเฉิน ผลัดที่ 1-3',
    'ห้องฝึกอบรมจำลองสถานการณ์',
    'หน่วยงานชันสูตรและนิติเวช',
    'ห้องฉุกเฉิน โซน CPR/วิกฤต',
    'ห้องตรวจโรคทั่วไป นอกเวลา',
  ];

  const colorPalette = [
    '#0C7C82', '#35B4B0', '#26A69A', '#AED581', '#FFCA28',
    '#FF8A65', '#EF5350', '#4A2C6D', '#D32F2F', '#F57C00',
    '#FBC02D', '#0288D1',
  ];

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setForm({
      title: '',
      subject: subjectsList[0],
      educationLevel: educationLevelsList[0],
      classroom: classroomList[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      dueTime: '16:00',
      description: '',
      maxScore: 100,
      tagColor: '#0C7C82',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setForm({
      title: asg.title,
      subject: asg.subject,
      educationLevel: asg.educationLevel,
      classroom: asg.classroom,
      dueDate: asg.dueDate,
      dueTime: asg.dueTime,
      description: asg.description,
      maxScore: asg.maxScore,
      tagColor: asg.tagColor || '#0C7C82',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      onOpenAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่องานที่มอบหมาย', 'warning');
      return;
    }

    if (editingAssignment) {
      const updated = assignments.map((a) =>
        a.id === editingAssignment.id ? { ...a, ...form } : a
      );
      onUpdateAssignments(updated);
      onOpenAlert('แก้ไขสำเร็จ', 'อัปเดตข้อมูลงานมอบหมายเรียบร้อยแล้ว', 'success');
    } else {
      const newAsg: Assignment = {
        id: `asg-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onUpdateAssignments([newAsg, ...assignments]);
      onOpenAlert('เพิ่มสำเร็จ', 'เพิ่มงานมอบหมายใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (asg: Assignment) => {
    onConfirmAction('ยืนยันการลบ', `คุณแน่ใจว่าต้องการลบงาน "${asg.title}" หรือไม่?`, () => {
      onUpdateAssignments(assignments.filter((a) => a.id !== asg.id));
      onOpenAlert('ลบสำเร็จ', 'ลบงานมอบหมายเรียบร้อยแล้ว', 'success');
    });
  };

  const filteredAssignments = assignments.filter((a) => {
    if (selectedSubjectFilter !== 'ทั้งหมด' && a.subject !== selectedSubjectFilter) return false;
    if (
      searchQuery &&
      !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0C7C82]" />
            เมนูมอบหมายงานและการฝึกอบรมทางคลินิก
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดภารกิจ, กำหนดรายวิชา, เลือกระดับชั้น/กลุ่มงาน, ห้องเรียน/ห้องตรวจ และเกณฑ์คะแนน
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{ backgroundColor: '#0C7C82' }}
          className="px-4 py-2.5 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มชื่องานมอบหมาย</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่องาน หรือ รายละเอียด"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0C7C82]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">รายวิชา:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-hidden"
          >
            <option value="ทั้งหมด">ทุกรายวิชา</option>
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            ไม่พบงานมอบหมายตามเงื่อนไขที่เลือก
          </div>
        ) : (
          filteredAssignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              style={{ borderTop: `4px solid ${asg.tagColor || '#0C7C82'}` }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: `${asg.tagColor || '#0C7C82'}15`,
                      color: asg.tagColor || '#0C7C82',
                    }}
                  >
                    {asg.subject}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Award className="w-3 h-3 text-amber-500" />
                    เต็ม {asg.maxScore} คะแนน
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                  {asg.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {asg.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>ระดับ/กลุ่ม: <strong className="text-slate-700">{asg.educationLevel}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>ห้อง/ผลัด: <strong className="text-slate-700">{asg.classroom}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>กำหนดส่ง: {asg.dueDate} เวลา {asg.dueTime} น.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(asg)}
                  className="px-3 py-1.5 text-slate-600 hover:text-[#0C7C82] hover:bg-teal-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
                <button
                  onClick={() => handleDelete(asg)}
                  className="px-3 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-sweet-pop border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0C7C82]" />
                {editingAssignment ? 'แก้ไขงานมอบหมาย' : 'เพิ่มชื่องานมอบหมายใหม่'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่องานมอบหมาย *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น รายงานการวิเคราะห์ Triage ประจำเดือน"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เลือกรายวิชา</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เลือกระดับชั้น / กลุ่มงาน</label>
                  <select
                    value={form.educationLevel}
                    onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {educationLevelsList.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เลือกห้องเรียน / ห้องตรวจ</label>
                  <select
                    value={form.classroom}
                    onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {classroomList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">กำหนดวันส่งงาน</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">กำหนดเวลาส่ง</label>
                  <input
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คะแนนเต็ม</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0C7C82]"
                  />
                </div>
                {/* Color picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#0C7C82]" />
                    ตั้งค่าสีแถบกำกับ
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {colorPalette.slice(0, 6).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, tagColor: c })}
                        className={`w-5 h-5 rounded-full cursor-pointer transition ${
                          form.tagColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={form.tagColor}
                      onChange={(e) => setForm({ ...form, tagColor: e.target.value })}
                      className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดงาน</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="วัตถุประสงค์ คำชี้แจง และเกณฑ์การประเมิน..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
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
                  บันทึกข้อมูลงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

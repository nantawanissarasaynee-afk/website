import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit,
  Eye,
  FileCheck,
  Filter,
  GraduationCap,
  HelpCircle,
  Palette,
  RefreshCw,
  Search,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { Submission, SubmissionStatus } from '../types';

interface SubmissionGradeViewProps {
  submissions: Submission[];
  onUpdateSubmissions: (subs: Submission[]) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SubmissionGradeView: React.FC<SubmissionGradeViewProps> = ({
  submissions,
  onUpdateSubmissions,
  onOpenAlert,
}) => {
  // Filters
  const [filterEducationLevel, setFilterEducationLevel] = useState('ทั้งหมด');
  const [filterClassroom, setFilterClassroom] = useState('ทั้งหมด');
  const [filterSubject, setFilterSubject] = useState('ทั้งหมด');
  const [filterStatus, setFilterStatus] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  // Grading Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<SubmissionStatus>('ตรวจแล้ว');
  const [feedback, setFeedback] = useState<string>('');
  const [tagColor, setTagColor] = useState<string>('#0C7C82');

  const educationLevels = Array.from(new Set(submissions.map((s) => s.educationLevel)));
  const classrooms = Array.from(new Set(submissions.map((s) => s.classroom)));
  const subjects = Array.from(new Set(submissions.map((s) => s.subject)));

  const colorPalette = [
    '#0C7C82', '#35B4B0', '#26A69A', '#AED581', '#FFCA28',
    '#FF8A65', '#EF5350', '#4A2C6D', '#D32F2F', '#F57C00',
    '#FBC02D', '#0288D1',
  ];

  const handleOpenGrade = (sub: Submission) => {
    setSelectedSub(sub);
    setScore(sub.score ?? 0);
    setStatus(sub.status);
    setFeedback(sub.feedback || '');
    setTagColor(sub.tagColor || '#0C7C82');
    setIsModalOpen(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    if (score > selectedSub.maxScore) {
      onOpenAlert('คะแนนเกินกำหนด', `คะแนนที่ให้ (${score}) มากกว่าคะแนนเต็ม (${selectedSub.maxScore})`, 'warning');
      return;
    }

    const updated = submissions.map((s) =>
      s.id === selectedSub.id
        ? {
            ...s,
            status,
            score,
            feedback,
            tagColor,
          }
        : s
    );

    onUpdateSubmissions(updated);
    onOpenAlert('บันทึกผลสำเร็จ', 'บันทึกการตรวจประเมินและให้คะแนนเรียบร้อยแล้ว', 'success');
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setFilterEducationLevel('ทั้งหมด');
    setFilterClassroom('ทั้งหมด');
    setFilterSubject('ทั้งหมด');
    setFilterStatus('ทั้งหมด');
    setSearchQuery('');
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filterEducationLevel !== 'ทั้งหมด' && s.educationLevel !== filterEducationLevel) return false;
    if (filterClassroom !== 'ทั้งหมด' && s.classroom !== filterClassroom) return false;
    if (filterSubject !== 'ทั้งหมด' && s.subject !== filterSubject) return false;
    if (filterStatus !== 'ทั้งหมด' && s.status !== filterStatus) return false;
    if (
      searchQuery &&
      !s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#0C7C82]" />
            เมนูตรวจการส่งงานและประเมินผล
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจผลงาน, ให้คะแนน, บันทึกข้อเสนอแนะ และตรวจสอบสถานะการส่งงานของบุคลากร
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-700">ส่งงานทั้งหมด: {submissions.length}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-emerald-700 font-bold">
            ตรวจแล้ว: {submissions.filter((s) => s.status === 'ตรวจแล้ว' || s.status === 'ให้คะแนน').length}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-amber-700 font-bold">
            รอตรวจ: {submissions.filter((s) => s.status === 'ยังไม่ตรวจ').length}
          </span>
        </div>
      </div>

      {/* Comprehensive Filter Form */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#0C7C82]" />
            ตัวกรองค้นหาการส่งงาน (Search & Dropdown Filters)
          </span>
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-[#0C7C82] flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>ล้างค่า</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Level Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              เลือกระดับชั้น / กลุ่มงาน
            </label>
            <select
              value={filterEducationLevel}
              onChange={(e) => setFilterEducationLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ทั้งหมด">ทุกระดับชั้น/กลุ่ม</option>
              {educationLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Classroom Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              เลือกห้องเรียน / ห้องตรวจ
            </label>
            <select
              value={filterClassroom}
              onChange={(e) => setFilterClassroom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ทั้งหมด">ทุกห้องเรียน/ห้องตรวจ</option>
              {classrooms.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              เลือกรายวิชา
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ทั้งหมด">ทุกรายวิชา</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              สถานะการตรวจงาน (Dropdown)
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="ทั้งหมด">ทุกสถานะ (All)</option>
              <option value="ยังไม่ตรวจ">⏳ ยังไม่ตรวจ</option>
              <option value="ตรวจแล้ว">✅ ตรวจแล้ว</option>
              <option value="งานไม่สมบูรณ์">⚠️ งานไม่สมบูรณ์</option>
              <option value="ให้คะแนน">⭐ ให้คะแนน</option>
            </select>
          </div>
        </div>

        {/* Search Keyword Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 relative">
          <Search className="w-4 h-4 absolute left-3 top-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ฟอร์มค้นหาข้อมูล: ชื่อผู้ส่ง, รหัสประจำตัว, หรือรายละเอียด"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0C7C82]"
          />
        </div>
      </div>

      {/* Submissions Table with Horizontal Overflow */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            รายการส่งงานที่ค้นพบ: <strong>{filteredSubmissions.length}</strong> รายการ
          </span>
          <span className="text-xs text-slate-400">ระบบประเมินผลสมรรถนะการพยาบาล</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse min-w-[960px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3.5 sticky left-0 bg-slate-50 z-10">ผู้ส่งงาน / รหัส</th>
                <th className="py-3 px-3">รายวิชา</th>
                <th className="py-3 px-3">ระดับชั้น / ห้องเรียน</th>
                <th className="py-3 px-3">วันที่ส่งงาน</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-3 text-center">คะแนนที่ได้</th>
                <th className="py-3 px-3">ข้อเสนอแนะ / ความเห็น</th>
                <th className="py-3 px-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    ไม่พบรายการส่งงานตามตัวกรองที่เลือก
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3.5 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: sub.tagColor || '#0C7C82' }}
                        />
                        <div>
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {sub.subject}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{sub.educationLevel}</div>
                      <div className="text-[10px] text-slate-400">{sub.classroom}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {sub.submittedDate}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          sub.status === 'ตรวจแล้ว'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : sub.status === 'ให้คะแนน'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : sub.status === 'งานไม่สมบูรณ์'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {sub.score !== undefined ? (
                        <div className="font-black text-slate-900 text-sm">
                          {sub.score}{' '}
                          <span className="text-[10px] font-normal text-slate-400">/ {sub.maxScore}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-[220px] truncate" title={sub.feedback}>
                      {sub.feedback || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenGrade(sub)}
                        style={{ backgroundColor: '#0C7C82' }}
                        className="px-3 py-1.5 text-white rounded-xl text-xs font-semibold hover:brightness-110 shadow-xs flex items-center gap-1.5 ml-auto transition"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>ตรวจ / ให้คะแนน</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading & Feedback Modal with Color Picker */}
      {isModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-sweet-pop border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#0C7C82]" />
                  บันทึกผลการตรวจและให้คะแนน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSub.studentName} ({selectedSub.studentId}) - {selectedSub.subject}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะการตรวจงาน
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="ตรวจแล้ว">✅ ตรวจแล้ว</option>
                    <option value="ให้คะแนน">⭐ ให้คะแนน</option>
                    <option value="งานไม่สมบูรณ์">⚠️ งานไม่สมบูรณ์</option>
                    <option value="ยังไม่ตรวจ">⏳ ยังไม่ตรวจ</option>
                  </select>
                </div>

                {/* Score Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนที่ได้ (เต็ม {selectedSub.maxScore})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedSub.maxScore}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0C7C82]"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#0C7C82]" />
                  ตั้งค่าสี Color Picker
                </label>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {colorPalette.slice(0, 8).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTagColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition ${
                        tagColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent ml-2"
                  />
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อเสนอแนะ / ความเห็นของอาจารย์ผู้ตรวจ
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="ระบุจุดเด่น ข้อควรปรับปรุง หรือคำแนะนำเพิ่มเติม..."
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
                  บันทึกผลการตรวจ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

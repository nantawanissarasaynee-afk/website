import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { ArrivalType, DispositionType, PatientRecord, ShiftType, SystemSettings, TriageLevel } from '../types';
import { exportToXLSX } from '../utils/excel';

interface PatientSearchViewProps {
  settings: SystemSettings;
  patients: PatientRecord[];
  onUpdatePatients: (patients: PatientRecord[]) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onConfirmAction: (title: string, message: string, action: () => void) => void;
}

export const PatientSearchView: React.FC<PatientSearchViewProps> = ({
  settings,
  patients,
  onUpdatePatients,
  onOpenAlert,
  onConfirmAction,
}) => {
  // Search Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterTimeStart, setFilterTimeStart] = useState('');
  const [filterTimeEnd, setFilterTimeEnd] = useState('');
  const [filterDiagnosis, setFilterDiagnosis] = useState('');
  const [filterTriage, setFilterTriage] = useState<string>('ทั้งหมด');
  const [filterCategory, setFilterCategory] = useState<string>('ทั้งหมด');
  const [filterDisposition, setFilterDisposition] = useState<string>('ทั้งหมด');

  // Edit/Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);

  const [form, setForm] = useState({
    hn: '',
    fullName: '',
    gender: 'ชาย' as 'ชาย' | 'หญิง',
    age: 35,
    visitDate: new Date().toISOString().slice(0, 10),
    visitTime: '11:00',
    shift: 'เช้า' as ShiftType,
    arrivalType: 'มาเอง' as ArrivalType,
    triageLevel: 'U' as TriageLevel,
    category: 'ตรวจโรคทั่วไป',
    diagnosis: '',
    icd10: '',
    disposition: 'กลับบ้าน' as DispositionType,
    triageAccuracy: 'Normal' as 'Normal' | 'Under Triage' | 'Over Triage',
    tagColor: '#0C7C82',
    notes: '',
  });

  const colorPalette = [
    '#0C7C82', '#35B4B0', '#26A69A', '#AED581', '#FFCA28',
    '#FF8A65', '#EF5350', '#4A2C6D', '#D32F2F', '#F57C00',
    '#FBC02D', '#0288D1',
  ];

  // Reset filters
  const handleResetFilters = () => {
    setFilterDate('');
    setFilterTimeStart('');
    setFilterTimeEnd('');
    setFilterDiagnosis('');
    setFilterTriage('ทั้งหมด');
    setFilterCategory('ทั้งหมด');
    setFilterDisposition('ทั้งหมด');
  };

  // Perform filtering
  const filteredPatients = patients.filter((p) => {
    if (filterDate && p.visitDate !== filterDate) return false;
    if (filterTimeStart && p.visitTime < filterTimeStart) return false;
    if (filterTimeEnd && p.visitTime > filterTimeEnd) return false;
    if (
      filterDiagnosis &&
      !p.diagnosis.toLowerCase().includes(filterDiagnosis.toLowerCase()) &&
      !p.icd10.toLowerCase().includes(filterDiagnosis.toLowerCase()) &&
      !p.fullName.toLowerCase().includes(filterDiagnosis.toLowerCase()) &&
      !p.hn.includes(filterDiagnosis)
    ) {
      return false;
    }
    if (filterTriage !== 'ทั้งหมด' && p.triageLevel !== filterTriage) return false;
    if (filterCategory !== 'ทั้งหมด' && p.category !== filterCategory) return false;
    if (filterDisposition !== 'ทั้งหมด' && p.disposition !== filterDisposition) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setForm({
      hn: `690${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      gender: 'ชาย',
      age: 35,
      visitDate: new Date().toISOString().slice(0, 10),
      visitTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      shift: 'เช้า',
      arrivalType: 'มาเอง',
      triageLevel: 'U',
      category: 'ตรวจโรคทั่วไป',
      diagnosis: '',
      icd10: '',
      disposition: 'กลับบ้าน',
      triageAccuracy: 'Normal',
      tagColor: '#0C7C82',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pat: PatientRecord) => {
    setEditingPatient(pat);
    setForm({
      hn: pat.hn,
      fullName: pat.fullName,
      gender: pat.gender,
      age: pat.age,
      visitDate: pat.visitDate,
      visitTime: pat.visitTime,
      shift: pat.shift,
      arrivalType: pat.arrivalType,
      triageLevel: pat.triageLevel,
      category: pat.category,
      diagnosis: pat.diagnosis,
      icd10: pat.icd10,
      disposition: pat.disposition,
      triageAccuracy: pat.triageAccuracy,
      tagColor: pat.tagColor || '#0C7C82',
      notes: pat.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hn || !form.fullName) {
      onOpenAlert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอก HN และชื่อผู้ป่วย', 'warning');
      return;
    }

    if (editingPatient) {
      const updated = patients.map((p) =>
        p.id === editingPatient.id ? { ...p, ...form } : p
      );
      onUpdatePatients(updated);
      onOpenAlert('แก้ไขสำเร็จ', 'อัปเดตข้อมูลผู้รับบริการเรียบร้อยแล้ว', 'success');
    } else {
      const newP: PatientRecord = {
        id: `pat-${Date.now()}`,
        ...form,
      };
      onUpdatePatients([newP, ...patients]);
      onOpenAlert('เพิ่มสำเร็จ', 'เพิ่มข้อมูลผู้รับบริการใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (pat: PatientRecord) => {
    onConfirmAction('ยืนยันการลบ', `คุณแน่ใจว่าต้องการลบข้อมูลผู้รับบริการ HN ${pat.hn} (${pat.fullName})?`, () => {
      onUpdatePatients(patients.filter((p) => p.id !== pat.id));
      onOpenAlert('ลบสำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
    });
  };

  const handleExportSearchResults = () => {
    exportToXLSX(filteredPatients, `Patient_Search_Results_${new Date().toISOString().slice(0, 10)}`, 'ผลการค้นหา');
    onOpenAlert('ส่งออกสำเร็จ', `ดาวน์โหลดข้อมูลผู้รับบริการ ${filteredPatients.length} รายการแล้ว`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-[#0C7C82]" />
            ค้นหาและสืบค้นข้อมูลผู้รับบริการ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สืบค้นตาม วัน-เวลา, การวินิจฉัยโรค, ระดับการคัดกรอง Triage R-E-U-S-N และจำแนกเป็นคอลัมน์ชัดเจน
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportSearchResults}
            className="px-3.5 py-2 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-xl text-xs font-semibold border border-sky-200 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            <span>ส่งออก Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#0C7C82' }}
            className="px-4 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้รับบริการ</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#0C7C82]" />
            ตัวกรองและเงื่อนไขการค้นหา (Search Criteria)
          </span>
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-[#0C7C82] flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>ล้างเงื่อนไขทั้งหมด</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              วัน/เดือน/ปี
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0C7C82]"
            />
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              เลือกช่วงเวลา (จาก - ถึง)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={filterTimeStart}
                onChange={(e) => setFilterTimeStart(e.target.value)}
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
              <span className="text-xs text-slate-400">-</span>
              <input
                type="time"
                value={filterTimeEnd}
                onChange={(e) => setFilterTimeEnd(e.target.value)}
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          {/* Triage Dropdown R E U S N */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Triage (R E U S N)
            </label>
            <select
              value={filterTriage}
              onChange={(e) => setFilterTriage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="ทั้งหมด">ทุกระดับ (All Triage)</option>
              <option value="R">🔴 R - Resuscitation (วิกฤต)</option>
              <option value="E">🟠 E - Emergency (ฉุกเฉิน)</option>
              <option value="U">🟡 U - Urgent (เร่งด่วน)</option>
              <option value="S">🟢 S - Semi-Urgent (ด่วนปานกลาง)</option>
              <option value="N">🔵 N - Non-Urgent (ไม่เร่งด่วน)</option>
            </select>
          </div>

          {/* Diagnosis / Keyword */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              การวินิจฉัย / ICD-10 / HN
            </label>
            <input
              type="text"
              value={filterDiagnosis}
              onChange={(e) => setFilterDiagnosis(e.target.value)}
              placeholder="ค้นหาโรค หรือ รหัส ICD-10 หรือ HN"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0C7C82]"
            />
          </div>
        </div>

        {/* Second row of filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทผู้ป่วย</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ทั้งหมด">ทุกประเภท</option>
              {settings.customCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">การจำหน่าย (Disposition)</label>
            <select
              value={filterDisposition}
              onChange={(e) => setFilterDisposition(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ทั้งหมด">ทุกสถานะการจำหน่าย</option>
              <option value="กลับบ้าน">กลับบ้าน</option>
              <option value="นอนรพ.">นอนรพ. (Admit)</option>
              <option value="ส่งต่อ">ส่งต่อ (Refer)</option>
              <option value="เสียชีวิต">เสียชีวิต (Dead)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Column Display with Horizontal Overflow */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            ผลการค้นหา: พบข้อมูล <strong>{filteredPatients.length}</strong> ราย
          </span>
          <span className="text-xs text-slate-400">แสดงผลคอลัมน์มาตรฐานการพยาบาล</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3.5 sticky left-0 bg-slate-50 z-10">สีป้าย/HN</th>
                <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3">เพศ/อายุ</th>
                <th className="py-3 px-3">วัน-เวลาตรวจ</th>
                <th className="py-3 px-3 text-center">Triage</th>
                <th className="py-3 px-3">การมารับบริการ</th>
                <th className="py-3 px-3">ประเภท</th>
                <th className="py-3 px-3">การวินิจฉัย (Diagnosis)</th>
                <th className="py-3 px-3">ICD-10</th>
                <th className="py-3 px-3">การจำหน่าย</th>
                <th className="py-3 px-3">หมายเหตุ</th>
                <th className="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-400">
                    ไม่พบข้อมูลผู้รับบริการที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: pat.tagColor || '#0C7C82' }}
                          title="Color Tag"
                        />
                        <span>{pat.hn}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {pat.fullName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {pat.gender} / {pat.age} ปี
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{pat.visitDate}</div>
                      <div className="text-[10px] text-slate-400">{pat.visitTime} น. (เวร{pat.shift})</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-black text-white"
                        style={{
                          backgroundColor:
                            settings.triageConfig[pat.triageLevel]?.color || '#0C7C82',
                        }}
                      >
                        {pat.triageLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {pat.arrivalType}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {pat.category}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 max-w-[260px] truncate" title={pat.diagnosis}>
                      {pat.diagnosis}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-600">
                      {pat.icd10 || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pat.disposition === 'เสียชีวิต'
                            ? 'bg-slate-900 text-white'
                            : pat.disposition === 'นอนรพ.'
                            ? 'bg-cyan-100 text-cyan-800'
                            : pat.disposition === 'ส่งต่อ'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pat.disposition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-[180px] truncate" title={pat.notes}>
                      {pat.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(pat)}
                          className="p-1.5 text-slate-500 hover:text-[#0C7C82] hover:bg-teal-50 rounded-lg transition"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="ลบ"
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

      {/* Edit / Add Modal with Color Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-sweet-pop border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0C7C82]" />
                {editingPatient ? 'แก้ไขข้อมูลผู้รับบริการ' : 'เพิ่มข้อมูลผู้รับบริการ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมายเลข HN *</label>
                  <input
                    type="text"
                    required
                    value={form.hn}
                    onChange={(e) => setForm({ ...form, hn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เพศ</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันที่</label>
                  <input
                    type="date"
                    value={form.visitDate}
                    onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวลา</label>
                  <input
                    type="time"
                    value={form.visitTime}
                    onChange={(e) => setForm({ ...form, visitTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ระดับ Triage</label>
                  <select
                    value={form.triageLevel}
                    onChange={(e) => setForm({ ...form, triageLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="R">R - วิกฤต (แดง)</option>
                    <option value="E">E - ฉุกเฉิน (ส้ม)</option>
                    <option value="U">U - เร่งด่วน (เหลือง)</option>
                    <option value="S">S - ปานกลาง (เขียวตอง)</option>
                    <option value="N">N - ไม่เร่งด่วน (เขียว)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภท</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {settings.customCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">การจำหน่าย</label>
                  <select
                    value={form.disposition}
                    onChange={(e) => setForm({ ...form, disposition: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="กลับบ้าน">กลับบ้าน</option>
                    <option value="นอนรพ.">นอนรพ.</option>
                    <option value="ส่งต่อ">ส่งต่อ</option>
                    <option value="เสียชีวิต">เสียชีวิต</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">การวินิจฉัย</label>
                  <input
                    type="text"
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="ระบุชื่อโรค หรือ ภาวะฉุกเฉิน"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ICD-10</label>
                  <input
                    type="text"
                    value={form.icd10}
                    onChange={(e) => setForm({ ...form, icd10: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="เช่น I21.0"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#0C7C82]" />
                  ตั้งค่าสี Color Picker
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPalette.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setForm({ ...form, tagColor: col })}
                        className={`w-6 h-6 rounded-full transition cursor-pointer ${
                          form.tagColor === col ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={form.tagColor}
                    onChange={(e) => setForm({ ...form, tagColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent ml-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หมายเหตุ</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

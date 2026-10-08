import React, { useState } from 'react';
import {
  Activity,
  Ambulance,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  HeartPulse,
  Hospital,
  Layers,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { ArrivalType, DispositionType, PatientRecord, ShiftRecord, ShiftType, SystemSettings, TriageLevel } from '../types';
import { convertRowsToShiftRecords, downloadPatientTemplate, downloadShiftTemplate, exportToCSV, exportToXLSX, parseExcelOrCSV } from '../utils/excel';

interface PatientManagementViewProps {
  settings: SystemSettings;
  patients: PatientRecord[];
  shiftRecords: ShiftRecord[];
  onUpdatePatients: (patients: PatientRecord[]) => void;
  onUpdateShiftRecords: (shifts: ShiftRecord[]) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  onConfirmAction: (title: string, message: string, action: () => void) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({
  settings,
  patients,
  shiftRecords,
  onUpdatePatients,
  onUpdateShiftRecords,
  onOpenAlert,
  onConfirmAction,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'shifts' | 'patients'>('shifts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states for Patient Record
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);

  // Patient form fields
  const [pForm, setPForm] = useState({
    hn: '',
    fullName: '',
    gender: 'ชาย' as 'ชาย' | 'หญิง',
    age: 30,
    visitDate: new Date().toISOString().slice(0, 10),
    visitTime: '10:00',
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

  // Modal states for Shift Record
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);

  // Shift form fields
  const [sForm, setSForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    shift: 'เช้า' as ShiftType,
    startTime: '08:00',
    endTime: '16:00',
    totalService: 100,
    R: 10,
    E: 20,
    U: 20,
    S: 25,
    N: 25,
    emergencyPatients: 25,
    trafficAccident: 10,
    generalAccident: 12,
    generalCheckup: 35,
    afterHoursCheckup: 10,
    admit: 10,
    otherServices: 5,
    triage1to5: 100,
    underTriage: 1,
    overTriage: 1,
    covid: 2,
    observeOver2h: 10,
    ems: 6,
    refer: 2,
    referLR: 0,
    pher: 1,
    autopsy: 10,
    referBack: 0,
    dead: 0,
    cpr: 1,
    rosc: 1,
    stemiByEMS: 0,
    strokeByEMS: 0,
    tft: 4,
    smc: 4,
    isHoliday: 'วันธรรมดา' as 'วันธรรมดา' | 'วันหยุด',
    tagColor: '#0C7C82',
  });

  // Color picker palette choices
  const colorPalette = [
    '#0C7C82', '#35B4B0', '#26A69A', '#AED581', '#FFCA28',
    '#FF8A65', '#EF5350', '#4A2C6D', '#D32F2F', '#F57C00',
    '#FBC02D', '#0288D1',
  ];

  // Open Add Patient Modal
  const handleOpenAddPatient = () => {
    setEditingPatient(null);
    setPForm({
      hn: `690${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      gender: 'ชาย',
      age: 30,
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
    setIsPatientModalOpen(true);
  };

  // Open Edit Patient Modal
  const handleOpenEditPatient = (pat: PatientRecord) => {
    setEditingPatient(pat);
    setPForm({
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
    setIsPatientModalOpen(true);
  };

  // Save Patient
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pForm.fullName.trim() || !pForm.hn.trim()) {
      onOpenAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุเลข HN และชื่อ-นามสกุลผู้ป่วย', 'warning');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (editingPatient) {
        const updated = patients.map((p) =>
          p.id === editingPatient.id ? { ...p, ...pForm } : p
        );
        onUpdatePatients(updated);
        onOpenAlert('แก้ไขสำเร็จ', 'อัปเดตข้อมูลผู้ป่วยเรียบร้อยแล้ว', 'success');
      } else {
        const newPat: PatientRecord = {
          id: `pat-${Date.now()}`,
          ...pForm,
        };
        onUpdatePatients([newPat, ...patients]);
        onOpenAlert('เพิ่มสำเร็จ', 'บันทึกข้อมูลผู้ป่วยใหม่เรียบร้อยแล้ว', 'success');
      }
      setIsLoading(false);
      setIsPatientModalOpen(false);
    }, 400);
  };

  // Delete Patient
  const handleDeletePatient = (id: string, name: string) => {
    onConfirmAction('ยืนยันการลบข้อมูล', `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ป่วย "${name}"?`, () => {
      onUpdatePatients(patients.filter((p) => p.id !== id));
      onOpenAlert('ลบสำเร็จ', 'ลบข้อมูลผู้ป่วยเรียบร้อยแล้ว', 'success');
    });
  };

  // Open Add Shift
  const handleOpenAddShift = () => {
    setEditingShift(null);
    setSForm({
      date: new Date().toISOString().slice(0, 10),
      shift: 'เช้า',
      startTime: '08:00',
      endTime: '16:00',
      totalService: 100,
      R: 12,
      E: 20,
      U: 18,
      S: 25,
      N: 25,
      emergencyPatients: 25,
      trafficAccident: 8,
      generalAccident: 10,
      generalCheckup: 35,
      afterHoursCheckup: 10,
      admit: 10,
      otherServices: 5,
      triage1to5: 100,
      underTriage: 1,
      overTriage: 1,
      covid: 2,
      observeOver2h: 10,
      ems: 6,
      refer: 2,
      referLR: 0,
      pher: 1,
      autopsy: 10,
      referBack: 0,
      dead: 0,
      cpr: 1,
      rosc: 1,
      stemiByEMS: 0,
      strokeByEMS: 0,
      tft: 4,
      smc: 4,
      isHoliday: 'วันธรรมดา',
      tagColor: '#0C7C82',
    });
    setIsShiftModalOpen(true);
  };

  // Open Edit Shift
  const handleOpenEditShift = (shift: ShiftRecord) => {
    setEditingShift(shift);
    setSForm({
      date: shift.date,
      shift: shift.shift,
      startTime: shift.startTime,
      endTime: shift.endTime,
      totalService: shift.totalService,
      R: shift.R,
      E: shift.E,
      U: shift.U,
      S: shift.S,
      N: shift.N,
      emergencyPatients: shift.emergencyPatients,
      trafficAccident: shift.trafficAccident,
      generalAccident: shift.generalAccident,
      generalCheckup: shift.generalCheckup,
      afterHoursCheckup: shift.afterHoursCheckup,
      admit: shift.admit,
      otherServices: shift.otherServices,
      triage1to5: shift.triage1to5,
      underTriage: shift.underTriage,
      overTriage: shift.overTriage,
      covid: shift.covid,
      observeOver2h: shift.observeOver2h,
      ems: shift.ems,
      refer: shift.refer,
      referLR: shift.referLR,
      pher: shift.pher,
      autopsy: shift.autopsy,
      referBack: shift.referBack,
      dead: shift.dead,
      cpr: shift.cpr,
      rosc: shift.rosc,
      stemiByEMS: shift.stemiByEMS,
      strokeByEMS: shift.strokeByEMS,
      tft: shift.tft,
      smc: shift.smc,
      isHoliday: shift.isHoliday,
      tagColor: shift.tagColor || '#0C7C82',
    });
    setIsShiftModalOpen(true);
  };

  // Save Shift
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (editingShift) {
        const updated = shiftRecords.map((s) =>
          s.id === editingShift.id ? { ...s, ...sForm } : s
        );
        onUpdateShiftRecords(updated);
        onOpenAlert('แก้ไขสำเร็จ', 'อัปเดตข้อมูลเวรเรียบร้อยแล้ว', 'success');
      } else {
        const newShift: ShiftRecord = {
          id: `shift-${Date.now()}`,
          ...sForm,
        };
        onUpdateShiftRecords([newShift, ...shiftRecords]);
        onOpenAlert('เพิ่มสำเร็จ', 'บันทึกข้อมูลผลัดเวรเรียบร้อยแล้ว', 'success');
      }
      setIsLoading(false);
      setIsShiftModalOpen(false);
    }, 400);
  };

  // Delete Shift
  const handleDeleteShift = (id: string, date: string, shift: string) => {
    onConfirmAction('ยืนยันการลบเวร', `คุณต้องการลบข้อมูลสถิติเวร ${shift} วันที่ ${date} ใช่หรือไม่?`, () => {
      onUpdateShiftRecords(shiftRecords.filter((s) => s.id !== id));
      onOpenAlert('ลบสำเร็จ', 'ลบข้อมูลเวรเรียบร้อยแล้ว', 'success');
    });
  };

  // Import Excel / CSV for Shifts
  const handleImportShiftFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const rows = await parseExcelOrCSV(file);
      if (!rows || rows.length === 0) {
        onOpenAlert('ไฟล์ว่างเปล่า', 'ไม่พบแถวข้อมูลในไฟล์ที่เลือก', 'warning');
        setIsLoading(false);
        return;
      }

      const importedShifts = convertRowsToShiftRecords(rows);
      onUpdateShiftRecords([...importedShifts, ...shiftRecords]);
      onOpenAlert('นำเข้าสำเร็จ', `นำเข้าข้อมูลสถิติเวรสำเร็จจำนวน ${importedShifts.length} รายการ`, 'success');
    } catch (err) {
      onOpenAlert('เกิดข้อผิดพลาด', 'ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์ Excel/CSV', 'error');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  // Export Shift Data
  const handleExportShiftXLSX = () => {
    exportToXLSX(shiftRecords, `ER_Duty_Records_${new Date().toISOString().slice(0, 10)}`, 'ข้อมูลเวร');
    onOpenAlert('ส่งออกสำเร็จ', 'ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว', 'success');
  };

  const handleExportShiftCSV = () => {
    exportToCSV(shiftRecords, `ER_Duty_Records_${new Date().toISOString().slice(0, 10)}`);
    onOpenAlert('ส่งออกสำเร็จ', 'ดาวน์โหลดไฟล์ CSV (UTF-8) เรียบร้อยแล้ว', 'success');
  };

  // Filtered lists
  const filteredPatients = patients.filter((p) => {
    if (selectedShiftFilter !== 'ทั้งหมด' && p.shift !== selectedShiftFilter) return false;
    if (
      searchQuery &&
      !p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.hn.includes(searchQuery) &&
      !p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredShifts = shiftRecords.filter((s) => {
    if (selectedShiftFilter !== 'ทั้งหมด' && s.shift !== selectedShiftFilter) return false;
    if (searchQuery && !s.date.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('shifts')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'shifts'
                  ? 'bg-[#0C7C82] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>สถิติผลัดเวร (Daily Shifts)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                {shiftRecords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('patients')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'patients'
                  ? 'bg-[#0C7C82] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>รายชื่อผู้ป่วย (Patient Cases)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                {patients.length}
              </span>
            </button>
          </div>
        </div>

        {/* Global actions: Add, Excel Import, Excel Export */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {activeSubTab === 'shifts' ? (
            <>
              {/* Template */}
              <button
                onClick={downloadShiftTemplate}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
                title="ดาวน์โหลดตัวอย่างไฟล์นำเข้า"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template Excel</span>
              </button>

              {/* Import Excel */}
              <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>นำเข้า Excel (.xlsx/.csv)</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportShiftFile}
                  className="hidden"
                />
              </label>

              {/* Export XLSX */}
              <button
                onClick={handleExportShiftXLSX}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-xl border border-sky-200 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                <span>ส่งออก Excel</span>
              </button>

              {/* Add Shift Button */}
              <button
                onClick={handleOpenAddShift}
                style={{ backgroundColor: '#0C7C82' }}
                className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มผลัดเวร</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={downloadPatientTemplate}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Template</span>
              </button>
              <button
                onClick={() => exportToXLSX(patients, `Patients_${new Date().toISOString().slice(0, 10)}`, 'ผู้ป่วย')}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-xl border border-sky-200 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                <span>ส่งออก Excel</span>
              </button>
              <button
                onClick={handleOpenAddPatient}
                style={{ backgroundColor: '#0C7C82' }}
                className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มข้อมูลผู้ป่วย</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'shifts' ? 'ค้นหาวันที่ เช่น 2026-06-01' : 'ค้นหาชื่อ, HN, การวินิจฉัย'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0C7C82] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">กรองเวร:</span>
          {(['ทั้งหมด', 'เช้า', 'บ่าย', 'ดึก'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedShiftFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                selectedShiftFilter === s
                  ? 'bg-[#0C7C82] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Table Container with horizontal overflow */}
      {activeSubTab === 'shifts' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0C7C82]" />
              ตารางบันทึกสถิติเวร ER (รองรับข้อมูล Realtime ตามฟอร์แมตกระทรวงฯ)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              แสดง {filteredShifts.length} ผลัดเวร
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 sticky left-0 bg-slate-50 z-10">วันที่</th>
                  <th className="py-3 px-3">เวร</th>
                  <th className="py-3 px-3 text-center">เวลา</th>
                  <th className="py-3 px-3 text-center">ยอดรวม</th>
                  <th className="py-3 px-3 text-center text-[#D32F2F]">R</th>
                  <th className="py-3 px-3 text-center text-[#F57C00]">E</th>
                  <th className="py-3 px-3 text-center text-[#FBC02D]">U</th>
                  <th className="py-3 px-3 text-center text-lime-700">S</th>
                  <th className="py-3 px-3 text-center text-teal-700">N</th>
                  <th className="py-3 px-3 text-center">ฉุกเฉิน</th>
                  <th className="py-3 px-3 text-center">อุบัติเหตุจราจร</th>
                  <th className="py-3 px-3 text-center">ตรวจโรคทั่วไป</th>
                  <th className="py-3 px-3 text-center">Admit</th>
                  <th className="py-3 px-3 text-center">ส่งต่อ (Refer)</th>
                  <th className="py-3 px-3 text-center">นิติเวช/ชันสูตร</th>
                  <th className="py-3 px-3 text-center">CPR / ROSC</th>
                  <th className="py-3 px-3 text-center">เสียชีวิต</th>
                  <th className="py-3 px-3 text-center">วันหยุด/ธรรมดา</th>
                  <th className="py-3 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="text-center py-10 text-slate-400">
                      ไม่พบข้อมูลผลัดเวรตามเงื่อนไขที่ระบุ
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 font-bold text-slate-900 sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: shift.tagColor || '#0C7C82' }}
                          />
                          <span>{shift.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            shift.shift === 'เช้า'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : shift.shift === 'บ่าย'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          เวร{shift.shift}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {shift.startTime} - {shift.endTime}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-slate-900 text-sm">
                        {shift.totalService}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#D32F2F] bg-red-50/30">
                        {shift.R}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#F57C00] bg-orange-50/30">
                        {shift.E}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600 bg-yellow-50/30">
                        {shift.U}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-lime-700 bg-lime-50/30">
                        {shift.S}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-teal-700 bg-teal-50/30">
                        {shift.N}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">
                        {shift.emergencyPatients}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">
                        {shift.trafficAccident}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">
                        {shift.generalCheckup}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#35B4B0]">
                        {shift.admit}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#0288D1]">
                        {shift.refer}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#4A2C6D]">
                        {shift.autopsy}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-rose-600">{shift.cpr}</span>
                        <span className="text-[10px] text-slate-400"> / {shift.rosc}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {shift.dead}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            shift.isHoliday === 'วันหยุด'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {shift.isHoliday}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditShift(shift)}
                            className="p-1.5 text-slate-500 hover:text-[#0C7C82] hover:bg-teal-50 rounded-lg transition"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shift.id, shift.date, shift.shift)}
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
      ) : (
        /* Patient Cases View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0C7C82]" />
              ตารางเวชระเบียนผู้ป่วยฉุกเฉินและนิติเวช
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              แสดง {filteredPatients.length} เคส
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">HN</th>
                  <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-3">เพศ/อายุ</th>
                  <th className="py-3 px-3">วัน-เวลาที่มารับบริการ</th>
                  <th className="py-3 px-3">เวร</th>
                  <th className="py-3 px-3">การมารับบริการ</th>
                  <th className="py-3 px-3 text-center">Triage</th>
                  <th className="py-3 px-3">ประเภทบริการ</th>
                  <th className="py-3 px-3">การวินิจฉัย (Diagnosis)</th>
                  <th className="py-3 px-3">การจำหน่าย</th>
                  <th className="py-3 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-slate-400">
                      ไม่พบข้อมูลผู้ป่วย
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 font-bold font-mono text-slate-900">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: pat.tagColor || '#0C7C82' }}
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
                        <div className="text-[10px] text-slate-400">{pat.visitTime} น.</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {pat.shift}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            pat.arrivalType === 'EMS'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : pat.arrivalType === 'มูลนิธิ/กู้ชีพ'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pat.arrivalType}
                        </span>
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
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {pat.category}
                      </td>
                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="font-medium text-slate-900 truncate" title={pat.diagnosis}>
                          {pat.diagnosis}
                        </div>
                        {pat.icd10 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            ICD-10: {pat.icd10}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditPatient(pat)}
                            className="p-1.5 text-slate-500 hover:text-[#0C7C82] hover:bg-teal-50 rounded-lg transition"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(pat.id, pat.fullName)}
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
      )}

      {/* Patient Add/Edit Modal */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-sweet-pop border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0C7C82]" />
                {editingPatient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วยรับบริการใหม่'}
              </h3>
              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หมายเลข HN *
                  </label>
                  <input
                    type="text"
                    required
                    value={pForm.hn}
                    onChange={(e) => setPForm({ ...pForm, hn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="เช่น 6901234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={pForm.fullName}
                    onChange={(e) => setPForm({ ...pForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="เช่น นายสมชาย มั่นคง"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เพศ</label>
                  <select
                    value={pForm.gender}
                    onChange={(e) => setPForm({ ...pForm, gender: e.target.value as any })}
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
                    min="0"
                    max="120"
                    value={pForm.age}
                    onChange={(e) => setPForm({ ...pForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันที่รับบริการ</label>
                  <input
                    type="date"
                    value={pForm.visitDate}
                    onChange={(e) => setPForm({ ...pForm, visitDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวลา (HH:mm)</label>
                  <input
                    type="time"
                    value={pForm.visitTime}
                    onChange={(e) => setPForm({ ...pForm, visitTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวร</label>
                  <select
                    value={pForm.shift}
                    onChange={(e) => setPForm({ ...pForm, shift: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="เช้า">เช้า (08:00 - 16:00)</option>
                    <option value="บ่าย">บ่าย (16:00 - 24:00)</option>
                    <option value="ดึก">ดึก (24:00 - 08:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">การมารับบริการ</label>
                  <select
                    value={pForm.arrivalType}
                    onChange={(e) => setPForm({ ...pForm, arrivalType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="มาเอง">มาเอง</option>
                    <option value="ญาตินำส่ง">ญาตินำส่ง</option>
                    <option value="EMS">EMS (หน่วยแพทย์ฉุกเฉิน)</option>
                    <option value="มูลนิธิ/กู้ชีพ">มูลนิธิ/กู้ชีพ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">การคัดกรอง Triage</label>
                  <select
                    value={pForm.triageLevel}
                    onChange={(e) => setPForm({ ...pForm, triageLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="R">R - ระดับ 1 วิกฤต (แดง)</option>
                    <option value="E">E - ระดับ 2 ฉุกเฉิน (ส้ม)</option>
                    <option value="U">U - ระดับ 3 เร่งด่วน (เหลือง)</option>
                    <option value="S">S - ระดับ 4 ด่วนปานกลาง (เขียวตอง)</option>
                    <option value="N">N - ระดับ 5 ไม่เร่งด่วน (เขียว)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทผู้ป่วย</label>
                  <select
                    value={pForm.category}
                    onChange={(e) => setPForm({ ...pForm, category: e.target.value })}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    การจำหน่ายผู้ป่วย (Disposition)
                  </label>
                  <select
                    value={pForm.disposition}
                    onChange={(e) => setPForm({ ...pForm, disposition: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="กลับบ้าน">กลับบ้าน</option>
                    <option value="นอนรพ.">นอนรพ. (Admit)</option>
                    <option value="ส่งต่อ">ส่งต่อ (Refer)</option>
                    <option value="เสียชีวิต">เสียชีวิต (Dead / DOA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">การวินิจฉัยโรค</label>
                  <input
                    type="text"
                    value={pForm.diagnosis}
                    onChange={(e) => setPForm({ ...pForm, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="เช่น Multiple laceration wound, Head trauma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ICD-10 Code</label>
                  <input
                    type="text"
                    value={pForm.icd10}
                    onChange={(e) => setPForm({ ...pForm, icd10: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="เช่น S06.0"
                  />
                </div>
              </div>

              {/* Color Picker Setting */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#0C7C82]" />
                  ตั้งค่าสีแถบกำกับ (Color Picker)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setPForm({ ...pForm, tagColor: color })}
                        className={`w-6 h-6 rounded-full cursor-pointer transition ${
                          pForm.tagColor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={pForm.tagColor}
                    onChange={(e) => setPForm({ ...pForm, tagColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent ml-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หมายเหตุ / อาการสำคัญ</label>
                <textarea
                  rows={2}
                  value={pForm.notes}
                  onChange={(e) => setPForm({ ...pForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="รายละเอียดเพิ่มเติม การรักษาเบื้องต้น..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#0C7C82' }}
                  className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-sm transition"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Add/Edit Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-sweet-pop border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0C7C82]" />
                {editingShift ? 'แก้ไขสถิติผลัดเวร' : 'บันทึกสถิติผลัดเวรใหม่'}
              </h3>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันที่ (Date)</label>
                  <input
                    type="date"
                    required
                    value={sForm.date}
                    onChange={(e) => setSForm({ ...sForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวร (Shift)</label>
                  <select
                    value={sForm.shift}
                    onChange={(e) => {
                      const sh = e.target.value as ShiftType;
                      let st = '08:00', et = '16:00';
                      if (sh === 'บ่าย') { st = '16:00'; et = '24:00'; }
                      if (sh === 'ดึก') { st = '24:00'; et = '08:00'; }
                      setSForm({ ...sForm, shift: sh, startTime: st, endTime: et });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="เช้า">เช้า (08:00 - 16:00)</option>
                    <option value="บ่าย">บ่าย (16:00 - 24:00)</option>
                    <option value="ดึก">ดึก (24:00 - 08:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทวัน</label>
                  <select
                    value={sForm.isHoliday}
                    onChange={(e) => setSForm({ ...sForm, isHoliday: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="วันธรรมดา">วันธรรมดา</option>
                    <option value="วันหยุด">วันหยุด</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ยอดผู้รับบริการรวม</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.totalService}
                    onChange={(e) => setSForm({ ...sForm, totalService: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#0C7C82]"
                  />
                </div>
              </div>

              {/* Triage 5-Levels counts */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  การคัดกรอง 5 ระดับ (Triage Levels)
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <label className="block text-[11px] font-bold text-[#D32F2F]">R (วิกฤต)</label>
                    <input
                      type="number"
                      min="0"
                      value={sForm.R}
                      onChange={(e) => setSForm({ ...sForm, R: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-center bg-white border border-red-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#F57C00]">E (ฉุกเฉิน)</label>
                    <input
                      type="number"
                      min="0"
                      value={sForm.E}
                      onChange={(e) => setSForm({ ...sForm, E: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-center bg-white border border-orange-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#FBC02D]">U (เร่งด่วน)</label>
                    <input
                      type="number"
                      min="0"
                      value={sForm.U}
                      onChange={(e) => setSForm({ ...sForm, U: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-center bg-white border border-yellow-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-lime-700">S (ปานกลาง)</label>
                    <input
                      type="number"
                      min="0"
                      value={sForm.S}
                      onChange={(e) => setSForm({ ...sForm, S: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-center bg-white border border-lime-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-teal-700">N (ไม่ด่วน)</label>
                    <input
                      type="number"
                      min="0"
                      value={sForm.N}
                      onChange={(e) => setSForm({ ...sForm, N: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-center bg-white border border-teal-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Service categories breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">อุบัติเหตุจราจร</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.trafficAccident}
                    onChange={(e) => setSForm({ ...sForm, trafficAccident: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">อุบัติเหตุทั่วไป</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.generalAccident}
                    onChange={(e) => setSForm({ ...sForm, generalAccident: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ตรวจโรคทั่วไป</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.generalCheckup}
                    onChange={(e) => setSForm({ ...sForm, generalCheckup: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ตรวจนอกเวลา (150 บ.)</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.afterHoursCheckup}
                    onChange={(e) => setSForm({ ...sForm, afterHoursCheckup: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Outcomes: Admit, Refer, Dead, CPR, Autopsy */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#35B4B0] mb-1">Admit (นอน รพ.)</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.admit}
                    onChange={(e) => setSForm({ ...sForm, admit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0288D1] mb-1">Refer (ส่งต่อ)</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.refer}
                    onChange={(e) => setSForm({ ...sForm, refer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A2C6D] mb-1">ชันสูตร/นิติเวช</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.autopsy}
                    onChange={(e) => setSForm({ ...sForm, autopsy: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-600 mb-1">CPR / ROSC</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      value={sForm.cpr}
                      placeholder="CPR"
                      onChange={(e) => setSForm({ ...sForm, cpr: Number(e.target.value) })}
                      className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={sForm.rosc}
                      placeholder="ROSC"
                      onChange={(e) => setSForm({ ...sForm, rosc: Number(e.target.value) })}
                      className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">เสียชีวิต (Dead)</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.dead}
                    onChange={(e) => setSForm({ ...sForm, dead: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Quality & Under/Over Triage */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">Under Triage</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.underTriage}
                    onChange={(e) => setSForm({ ...sForm, underTriage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-sky-800 mb-1">Over Triage</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.overTriage}
                    onChange={(e) => setSForm({ ...sForm, overTriage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-800 mb-1">Covid-19</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.covid}
                    onChange={(e) => setSForm({ ...sForm, covid: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">EMS นำส่ง</label>
                  <input
                    type="number"
                    min="0"
                    value={sForm.ems}
                    onChange={(e) => setSForm({ ...sForm, ems: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#0C7C82]" />
                  ตั้งค่าสีป้ายกำกับ
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPalette.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSForm({ ...sForm, tagColor: c })}
                        className={`w-6 h-6 rounded-full cursor-pointer transition ${
                          sForm.tagColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#0C7C82' }}
                  className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-sm transition"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

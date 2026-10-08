import * as XLSX from 'xlsx';
import { ShiftRecord, PatientRecord, User } from '../types';

/**
 * Utility to download data as XLSX file
 */
export function exportToXLSX(data: any[], fileName: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Utility to download data as CSV with UTF-8 BOM so Excel opens Thai properly
 */
export function exportToCSV(data: any[], fileName: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        let val = row[header] ?? '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse an uploaded Excel or CSV file
 */
export async function parseExcelOrCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Check if it's CSV
    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const workbook = XLSX.read(text, { type: 'string', raw: false });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file, 'utf-8');
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Download Shift Data Template
 */
export function downloadShiftTemplate() {
  const sample = [
    {
      'Date': '2026-06-01',
      'Shift': 'เช้า',
      'Start Time': '08:00',
      'End Time': '16:00',
      'Total Service': 120,
      'R': 15,
      'E': 25,
      'U': 20,
      'S': 30,
      'N': 30,
      'ผู้ป่วยฉุกเฉิน': 30,
      'อุบัติเหตุจราจร': 10,
      'อุบัติเหตุทั่วไป': 15,
      'ตรวจโรคทั่วไป': 45,
      'ตรวจโรคทั่วไป (นอกเวลาราชการ 150 บาท)': 10,
      'Admit': 10,
      'รับบริการอื่นๆ': 8,
      'Triage level 1-5': 120,
      'Under Triage': 2,
      'Over Triage': 1,
      'Covid': 4,
      'Observe >2h': 15,
      'EMS': 8,
      'Refer': 3,
      'Refer LR': 1,
      'Pher': 2,
      'ชันสูตร': 18,
      'Refer back': 1,
      'Dead': 1,
      'CPR': 1,
      'ROSC': 1,
      'STEMI by EMS': 1,
      'Stroke by EMS': 1,
      'TFT': 6,
      'SMC': 6,
      'IsHoliday': 'วันธรรมดา',
    },
    {
      'Date': '2026-06-01',
      'Shift': 'บ่าย',
      'Start Time': '16:00',
      'End Time': '24:00',
      'Total Service': 90,
      'R': 10,
      'E': 18,
      'U': 15,
      'S': 25,
      'N': 22,
      'ผู้ป่วยฉุกเฉิน': 22,
      'อุบัติเหตุจราจร': 8,
      'อุบัติเหตุทั่วไป': 10,
      'ตรวจโรคทั่วไป': 30,
      'ตรวจโรคทั่วไป (นอกเวลาราชการ 150 บาท)': 10,
      'Admit': 10,
      'รับบริการอื่นๆ': 0,
      'Triage level 1-5': 90,
      'Under Triage': 1,
      'Over Triage': 0,
      'Covid': 2,
      'Observe >2h': 10,
      'EMS': 5,
      'Refer': 2,
      'Refer LR': 0,
      'Pher': 1,
      'ชันสูตร': 12,
      'Refer back': 0,
      'Dead': 0,
      'CPR': 0,
      'ROSC': 0,
      'STEMI by EMS': 0,
      'Stroke by EMS': 0,
      'TFT': 4,
      'SMC': 4,
      'IsHoliday': 'วันธรรมดา',
    },
  ];
  exportToXLSX(sample, 'Template_ER_Shift_Records', 'เวรฉุกเฉิน');
}

/**
 * Download User Template
 */
export function downloadUserTemplate() {
  const sample = [
    {
      'username': 'nurse3',
      'password': 'nurse123',
      'fullName': 'พว. นฤมล แก้วตา (พยาบาลวิชาชีพ)',
      'role': 'ผู้ใช้งาน', // 'ผู้ดูแลระบบ' หรือ 'ผู้ใช้งาน'
      'department': 'งานการพยาบาลอุบัติเหตุฉุกเฉิน',
      'phone': '089-123-4567',
    },
    {
      'username': 'er_admin2',
      'password': 'admin123',
      'fullName': 'นพ. ภัทรพล เจริญสุข (รองหัวหน้างาน ER)',
      'role': 'ผู้ดูแลระบบ',
      'department': 'กลุ่มงานอุบัติเหตุฉุกเฉินและนิติเวช',
      'phone': '081-234-5678',
    },
  ];
  exportToXLSX(sample, 'Template_Users_List', 'รายชื่อผู้ใช้');
}

/**
 * Download Patient Template
 */
export function downloadPatientTemplate() {
  const sample = [
    {
      'HN': '6901242',
      'ชื่อ-นามสกุล': 'นายกิตติคุณ มั่งมี',
      'เพศ': 'ชาย',
      'อายุ': 42,
      'วันที่รับบริการ': '2026-06-03',
      'เวลา': '20:15',
      'เวร': 'บ่าย',
      'การมารับบริการ': 'EMS',
      'Triage': 'E',
      'ประเภท': 'อุบัติเหตุจราจร',
      'การวินิจฉัย': 'Head injury with concussion',
      'ICD10': 'S06.0',
      'การจำหน่าย': 'นอนรพ.',
      'หมายเหตุ': 'CT brain ปกติ แอดมิทสังเกตอาการ 24 ชม.',
    },
  ];
  exportToXLSX(sample, 'Template_Patient_Records', 'เวชระเบียนผู้ป่วย');
}

/**
 * Format raw imported rows to ShiftRecord
 */
export function convertRowsToShiftRecords(rows: any[]): ShiftRecord[] {
  return rows.map((r, idx) => ({
    id: `shift-import-${Date.now()}-${idx}`,
    date: String(r['Date'] || r['date'] || new Date().toISOString().slice(0, 10)),
    shift: (r['Shift'] || r['shift'] || 'เช้า') as any,
    startTime: String(r['Start Time'] || r['startTime'] || '08:00'),
    endTime: String(r['End Time'] || r['endTime'] || '16:00'),
    totalService: Number(r['Total Service'] || r['totalService'] || 0),
    R: Number(r['R'] || 0),
    E: Number(r['E'] || 0),
    U: Number(r['U'] || 0),
    S: Number(r['S'] || 0),
    N: Number(r['N'] || 0),
    emergencyPatients: Number(r['ผู้ป่วยฉุกเฉิน'] || r['emergencyPatients'] || 0),
    trafficAccident: Number(r['อุบัติเหตุจราจร'] || r['trafficAccident'] || 0),
    generalAccident: Number(r['อุบัติเหตุทั่วไป'] || r['generalAccident'] || 0),
    generalCheckup: Number(r['ตรวจโรคทั่วไป'] || r['generalCheckup'] || 0),
    afterHoursCheckup: Number(r['ตรวจโรคทั่วไป (นอกเวลาราชการ 150 บาท)'] || r['afterHoursCheckup'] || 0),
    admit: Number(r['Admit'] || r['admit'] || 0),
    otherServices: Number(r['รับบริการอื่นๆ'] || r['otherServices'] || 0),
    triage1to5: Number(r['Triage level 1-5'] || r['triage1to5'] || 0),
    underTriage: Number(r['Under Triage'] || r['underTriage'] || 0),
    overTriage: Number(r['Over Triage'] || r['overTriage'] || 0),
    covid: Number(r['Covid'] || r['covid'] || 0),
    observeOver2h: Number(r['Observe >2h'] || r['observeOver2h'] || 0),
    ems: Number(r['EMS'] || r['ems'] || 0),
    refer: Number(r['Refer'] || r['refer'] || 0),
    referLR: Number(r['Refer LR'] || r['referLR'] || 0),
    pher: Number(r['Pher'] || r['pher'] || 0),
    autopsy: Number(r['ชันสูตร'] || r['autopsy'] || 0),
    referBack: Number(r['Refer back'] || r['referBack'] || 0),
    dead: Number(r['Dead'] || r['dead'] || 0),
    cpr: Number(r['CPR'] || r['cpr'] || 0),
    rosc: Number(r['ROSC'] || r['rosc'] || 0),
    stemiByEMS: Number(r['STEMI by EMS'] || r['stemiByEMS'] || 0),
    strokeByEMS: Number(r['Stroke by EMS'] || r['strokeByEMS'] || 0),
    tft: Number(r['TFT'] || r['tft'] || 0),
    smc: Number(r['SMC'] || r['smc'] || 0),
    isHoliday: (r['IsHoliday'] === 'วันหยุด' || r['isHoliday'] === 'วันหยุด') ? 'วันหยุด' : 'วันธรรมดา',
    tagColor: '#0C7C82',
  }));
}

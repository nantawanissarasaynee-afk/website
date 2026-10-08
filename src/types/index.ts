export type TriageLevel = 'R' | 'E' | 'U' | 'S' | 'N';

export type ShiftType = 'เช้า' | 'บ่าย' | 'ดึก';

export type ArrivalType = 'มาเอง' | 'ญาตินำส่ง' | 'EMS' | 'มูลนิธิ/กู้ชีพ';

export type DispositionType = 'กลับบ้าน' | 'ส่งต่อ' | 'เสียชีวิต' | 'นอนรพ.';

export type UserRole = 'admin' | 'nurse' | 'user';

export type SubmissionStatus = 'ตรวจแล้ว' | 'ยังไม่ตรวจ' | 'งานไม่สมบูรณ์' | 'ให้คะแนน';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  color?: string;
  createdAt: string;
}

export interface ShiftRecord {
  id: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  startTime: string;
  endTime: string;
  totalService: number;
  R: number; // Resuscitation (วิกฤต)
  E: number; // Emergency (ฉุกเฉิน)
  U: number; // Urgent (เร่งด่วน)
  S: number; // Semi-Urgent (เร่งด่วนปานกลาง)
  N: number; // Non-Urgent (ไม่เร่งด่วน)
  emergencyPatients: number; // ผู้ป่วยฉุกเฉิน
  trafficAccident: number; // อุบัติเหตุจราจร
  generalAccident: number; // อุบัติเหตุทั่วไป
  generalCheckup: number; // ตรวจโรคทั่วไป
  afterHoursCheckup: number; // ตรวจโรคทั่วไป (นอกเวลาราชการ 150 บาท)
  admit: number; // นอนโรงพยาบาล
  otherServices: number; // รับบริการอื่นๆ (ทำแผล ฉีดยา)
  triage1to5: number;
  underTriage: number;
  overTriage: number;
  covid: number;
  observeOver2h: number; // Observe >2h
  ems: number;
  refer: number;
  referLR: number;
  pher: number;
  autopsy: number; // ชันสูตร
  referBack: number;
  dead: number;
  cpr: number;
  rosc: number;
  stemiByEMS: number;
  strokeByEMS: number;
  tft: number;
  smc: number;
  isHoliday: 'วันธรรมดา' | 'วันหยุด';
  notes?: string;
  tagColor?: string;
}

export interface PatientRecord {
  id: string;
  hn: string;
  fullName: string;
  gender: 'ชาย' | 'หญิง';
  age: number;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // HH:mm
  shift: ShiftType;
  arrivalType: ArrivalType;
  triageLevel: TriageLevel;
  category: string;
  diagnosis: string;
  icd10: string;
  disposition: DispositionType;
  triageAccuracy: 'Normal' | 'Under Triage' | 'Over Triage';
  tagColor: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  educationLevel: string; // เช่น 'กลุ่มงานเวชปฏิบัติฉุกเฉิน', 'พยาบาลใหม่รุ่นที่ 1'
  classroom: string; // เช่น 'ห้องฉุกเฉิน ผลัด 1', 'ห้องอบรม CPR'
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  description: string;
  maxScore: number;
  tagColor: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentName: string;
  studentId: string;
  classroom: string;
  educationLevel: string;
  subject: string;
  status: SubmissionStatus;
  score?: number;
  maxScore: number;
  feedback?: string;
  submittedDate: string;
  tagColor: string;
}

export interface SystemSettings {
  hospitalName: string;
  departmentName: string;
  affiliation: string;
  logoUrl: string;
  themeColor: string;
  triageConfig: {
    R: { name: string; label: string; color: string; desc: string };
    E: { name: string; label: string; color: string; desc: string };
    U: { name: string; label: string; color: string; desc: string };
    S: { name: string; label: string; color: string; desc: string };
    N: { name: string; label: string; color: string; desc: string };
  };
  customCategories: string[];
}

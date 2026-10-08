import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  Hospital,
  PieChart,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { PatientRecord, ShiftRecord, SystemSettings } from '../types';
import { CanvasBarChart, CanvasDonutChart } from './Charts';

interface DashboardViewProps {
  settings: SystemSettings;
  shiftRecords: ShiftRecord[];
  patients: PatientRecord[];
  onNavigateTab: (tab: string) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  shiftRecords,
  patients,
  onNavigateTab,
  onOpenAlert,
}) => {
  const [selectedShift, setSelectedShift] = useState<string>('ทั้งหมด');
  const [selectedDate, setSelectedDate] = useState<string>('ทั้งหมด');

  // Unique dates from shift records
  const uniqueDates = Array.from(new Set(shiftRecords.map((s) => s.date))).sort().reverse();

  // Filtered records
  const filteredShifts = shiftRecords.filter((s) => {
    if (selectedShift !== 'ทั้งหมด' && s.shift !== selectedShift) return false;
    if (selectedDate !== 'ทั้งหมด' && s.date !== selectedDate) return false;
    return true;
  });

  // Totals
  const totalService = filteredShifts.reduce((a, b) => a + b.totalService, 0);
  const totalR = filteredShifts.reduce((a, b) => a + b.R, 0);
  const totalE = filteredShifts.reduce((a, b) => a + b.E, 0);
  const totalU = filteredShifts.reduce((a, b) => a + b.U, 0);
  const totalS = filteredShifts.reduce((a, b) => a + b.S, 0);
  const totalN = filteredShifts.reduce((a, b) => a + b.N, 0);

  const totalEmergency = filteredShifts.reduce((a, b) => a + b.emergencyPatients, 0);
  const totalTrafficAccident = filteredShifts.reduce((a, b) => a + b.trafficAccident, 0);
  const totalGeneralAccident = filteredShifts.reduce((a, b) => a + b.generalAccident, 0);
  const totalGeneralCheckup = filteredShifts.reduce((a, b) => a + b.generalCheckup, 0);
  const totalAfterHours = filteredShifts.reduce((a, b) => a + b.afterHoursCheckup, 0);
  const totalAdmit = filteredShifts.reduce((a, b) => a + b.admit, 0);
  const totalOthers = filteredShifts.reduce((a, b) => a + b.otherServices, 0);
  const totalRefer = filteredShifts.reduce((a, b) => a + b.refer, 0);
  const totalReferLR = filteredShifts.reduce((a, b) => a + b.referLR, 0);
  const totalAutopsy = filteredShifts.reduce((a, b) => a + b.autopsy, 0);
  const totalDead = filteredShifts.reduce((a, b) => a + b.dead, 0);
  const totalCPR = filteredShifts.reduce((a, b) => a + b.cpr, 0);
  const totalROSC = filteredShifts.reduce((a, b) => a + b.rosc, 0);
  const totalEMS = filteredShifts.reduce((a, b) => a + b.ems, 0);
  const totalSTEMI = filteredShifts.reduce((a, b) => a + b.stemiByEMS, 0);
  const totalStroke = filteredShifts.reduce((a, b) => a + b.strokeByEMS, 0);
  const totalUnderTriage = filteredShifts.reduce((a, b) => a + b.underTriage, 0);
  const totalOverTriage = filteredShifts.reduce((a, b) => a + b.overTriage, 0);

  // Categories config for colored cards and progress fills
  const categoryCards = [
    {
      title: 'ผู้ป่วยฉุกเฉิน (Emergency)',
      count: totalEmergency,
      color: '#D32F2F',
      bgLight: 'bg-red-50/80',
      borderColor: 'border-red-200',
      icon: Activity,
      categoryKey: 'Emergency',
    },
    {
      title: 'อุบัติเหตุจราจร (Traffic)',
      count: totalTrafficAccident,
      color: '#F57C00',
      bgLight: 'bg-orange-50/80',
      borderColor: 'border-orange-200',
      icon: AlertTriangle,
      categoryKey: 'Traffic',
    },
    {
      title: 'อุบัติเหตุทั่วไป (General Accident)',
      count: totalGeneralAccident,
      color: '#FF8A65',
      bgLight: 'bg-rose-50/80',
      borderColor: 'border-rose-200',
      icon: AlertOctagon,
      categoryKey: 'General Accident',
    },
    {
      title: 'ตรวจโรคทั่วไป (OPD/ER)',
      count: totalGeneralCheckup,
      color: '#0C7C82',
      bgLight: 'bg-teal-50/80',
      borderColor: 'border-teal-200',
      icon: UserCheck,
      categoryKey: 'General Checkup',
    },
    {
      title: 'ตรวจโรคนอกเวลา (150 บาท)',
      count: totalAfterHours,
      color: '#0288D1',
      bgLight: 'bg-sky-50/80',
      borderColor: 'border-sky-200',
      icon: Clock,
      categoryKey: 'After Hours',
    },
    {
      title: 'นอนโรงพยาบาล (Admit)',
      count: totalAdmit,
      color: '#35B4B0',
      bgLight: 'bg-cyan-50/80',
      borderColor: 'border-cyan-200',
      icon: Hospital,
      categoryKey: 'Admit',
    },
    {
      title: 'ส่งต่อผู้ป่วย (Refer)',
      count: totalRefer,
      countSub: `(LR: ${totalReferLR})`,
      color: '#4A2C6D',
      bgLight: 'bg-purple-50/80',
      borderColor: 'border-purple-200',
      icon: Ambulance,
      categoryKey: 'Refer',
    },
    {
      title: 'งานชันสูตรพลิกศพ / นิติเวช',
      count: totalAutopsy,
      color: '#64748B',
      bgLight: 'bg-slate-100',
      borderColor: 'border-slate-300',
      icon: FileText,
      categoryKey: 'Autopsy',
    },
    {
      title: 'รับบริการอื่นๆ (ทำแผล/ฉีดยา)',
      count: totalOthers,
      color: '#26A69A',
      bgLight: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
      icon: CheckCircle,
      categoryKey: 'Others',
    },
    {
      title: 'ช่วยฟื้นคืนชีพ (CPR / ROSC)',
      count: totalCPR,
      countSub: `(ROSC: ${totalROSC})`,
      color: '#EF5350',
      bgLight: 'bg-rose-50',
      borderColor: 'border-rose-200',
      icon: HeartPulse,
      categoryKey: 'CPR',
    },
  ];

  // Donut chart data for Triage Breakdown
  const triageDonutData = [
    { label: 'R (วิกฤต)', value: totalR, color: '#D32F2F' },
    { label: 'E (ฉุกเฉิน)', value: totalE, color: '#F57C00' },
    { label: 'U (เร่งด่วน)', value: totalU, color: '#FBC02D' },
    { label: 'S (ด่วนปานกลาง)', value: totalS, color: '#AED581' },
    { label: 'N (ไม่ด่วน)', value: totalN, color: '#26A69A' },
  ];

  // Shift Comparison Bar Chart
  const shiftTypes = ['เช้า', 'บ่าย', 'ดึก'];
  const shiftTotals = shiftTypes.map((st) =>
    shiftRecords
      .filter((s) => s.shift === st && (selectedDate === 'ทั้งหมด' || s.date === selectedDate))
      .reduce((a, b) => a + b.totalService, 0)
  );
  const shiftAccidents = shiftTypes.map((st) =>
    shiftRecords
      .filter((s) => s.shift === st && (selectedDate === 'ทั้งหมด' || s.date === selectedDate))
      .reduce((a, b) => a + b.trafficAccident + b.generalAccident, 0)
  );
  const shiftAdmits = shiftTypes.map((st) =>
    shiftRecords
      .filter((s) => s.shift === st && (selectedDate === 'ทั้งหมด' || s.date === selectedDate))
      .reduce((a, b) => a + b.admit, 0)
  );

  return (
    <div className="space-y-6">
      {/* Top Bar Filter & Quick Action */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-[#0C7C82]">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                แดชบอร์ดสรุปงานอุบัติเหตุฉุกเฉินและนิติเวช
              </h2>
              <p className="text-xs text-slate-500">
                ข้อมูลสรุปเชิงลึกงานบริการผู้ป่วย ER, Triage และผลการปฏิบัติงาน
              </p>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">วันที่:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="ทั้งหมด">ทุกวันที่บันทึก</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">เวร:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="ทั้งหมด">ทุกเวร (เช้า/บ่าย/ดึก)</option>
              <option value="เช้า">เวรเช้า (08:00 - 16:00)</option>
              <option value="บ่าย">เวรบ่าย (16:00 - 24:00)</option>
              <option value="ดึก">เวรดึก (24:00 - 08:00)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedShift('ทั้งหมด');
              setSelectedDate('ทั้งหมด');
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            title="รีเซ็ตตัวกรอง"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Big Summary Card (card แสดงจำนวนงานทั้งหมด) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0C7C82] via-[#26A69A] to-[#35B4B0] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-900/15">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              สรุปภาพรวมภาระงานบริการทั้งหมด
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              {totalService.toLocaleString()} <span className="text-xl font-normal opacity-90">ราย / เคส</span>
            </h3>
            <p className="text-xs sm:text-sm text-teal-50 leading-relaxed opacity-95">
              ยอดสะสมผู้รับบริการงานอุบัติเหตุฉุกเฉินและนิติเวช รพ.หลวงพ่อเปิ่น (คำนวณจาก {filteredShifts.length} ผลัดเวรที่บันทึก)
            </p>
          </div>

          {/* Quick Metrics in Pill Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl text-center border border-white/20">
              <span className="text-[11px] block text-teal-100 font-medium">Fast Track STEMI/Stroke</span>
              <span className="text-2xl font-black">{totalSTEMI + totalStroke}</span>
              <span className="text-[10px] block opacity-80">เคส</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl text-center border border-white/20">
              <span className="text-[11px] block text-teal-100 font-medium">EMS นำส่ง</span>
              <span className="text-2xl font-black">{totalEMS}</span>
              <span className="text-[10px] block opacity-80">เที่ยว</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl text-center border border-white/20">
              <span className="text-[11px] block text-teal-100 font-medium">Under Triage</span>
              <span className="text-2xl font-black text-amber-300">{totalUnderTriage}</span>
              <span className="text-[10px] block opacity-80">ราย</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl text-center border border-white/20">
              <span className="text-[11px] block text-teal-100 font-medium">Over Triage</span>
              <span className="text-2xl font-black text-sky-200">{totalOverTriage}</span>
              <span className="text-[10px] block opacity-80">ราย</span>
            </div>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Category Cards with assigned colors & Progress Fill bars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0C7C82]" />
            สัดส่วนภาระงานแยกตามประเภท (Progress Fill & Categories)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            คลิกเพื่อดูรายละเอียด
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categoryCards.map((card, idx) => {
            const Icon = card.icon;
            const percentage = totalService > 0 ? ((card.count / totalService) * 100).toFixed(1) : '0';

            return (
              <div
                key={idx}
                className={`${card.bgLight} rounded-2xl p-4 border ${card.borderColor} shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: card.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${card.color}15`, color: card.color }}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-700 line-clamp-1">{card.title}</h4>
                  
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{card.count}</span>
                    {card.countSub && <span className="text-xs font-semibold text-slate-500">{card.countSub}</span>}
                    <span className="text-[10px] text-slate-500">ราย</span>
                  </div>
                </div>

                {/* Progress Fill bar */}
                <div className="mt-3">
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Number(percentage))}%`,
                        backgroundColor: card.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart.js / Canvas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Triage Level Canvas Donut Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#D32F2F]" />
              การคัดกรอง 5 ระดับ (Triage 5-Level)
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{totalService} เคส</span>
          </div>

          <div className="my-auto py-2">
            <CanvasDonutChart
              data={triageDonutData}
              title="สัดส่วนความรุนแรงผู้ป่วย"
              subTitle="Emergency Severity Index (ESI)"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>R: วิกฤต | E: ฉุกเฉิน | U: เร่งด่วน</span>
            <span>S: ด่วนปานกลาง | N: ไม่ด่วน</span>
          </div>
        </div>

        {/* Shift Comparison Canvas Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0C7C82]" />
              เปรียบเทียบภาระงานตามผลัดเวร (เช้า / บ่าย / ดึก)
            </h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
              3 เวรต่อวัน
            </span>
          </div>

          <div className="my-auto py-2">
            <CanvasBarChart
              categories={['เวรเช้า (08:00-16:00)', 'เวรบ่าย (16:00-24:00)', 'เวรดึก (24:00-08:00)']}
              series={[
                { name: 'ผู้รับบริการทั้งหมด', color: '#0C7C82', data: shiftTotals },
                { name: 'อุบัติเหตุรวม', color: '#F57C00', data: shiftAccidents },
                { name: 'นอนโรงพยาบาล (Admit)', color: '#35B4B0', data: shiftAdmits },
              ]}
              title=""
            />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ข้อมูลบันทึกจริงจากตารางเวร รพ.หลวงพ่อเปิ่น</span>
            <button
              onClick={() => onNavigateTab('patients')}
              className="text-[#0C7C82] font-bold hover:underline"
            >
              ดูตารางเวรทั้งหมด →
            </button>
          </div>
        </div>
      </div>

      {/* Critical Care & Quality Triage Indicators Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-600" />
          ตัวชี้วัดความปลอดภัยและคุณภาพบริการวิกฤต (Critical Safety & Quality)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">ช่วยฟื้นคืนชีพ (CPR)</span>
            <span className="text-2xl font-black text-rose-600">{totalCPR}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">เคส</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">คืนชีพสำเร็จ (ROSC)</span>
            <span className="text-2xl font-black text-emerald-600">{totalROSC}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">เคส</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">เสียชีวิต (Dead)</span>
            <span className="text-2xl font-black text-slate-800">{totalDead}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">เคส</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">สังเกตอาการ &gt; 2 ชม.</span>
            <span className="text-2xl font-black text-[#0288D1]">
              {filteredShifts.reduce((a, b) => a + b.observeOver2h, 0)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">เคส</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">Under Triage</span>
            <span className="text-2xl font-black text-[#F57C00]">{totalUnderTriage}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ต่ำกว่าเกณฑ์</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">Over Triage</span>
            <span className="text-2xl font-black text-[#0C7C82]">{totalOverTriage}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">สูงกว่าเกณฑ์</span>
          </div>
        </div>
      </div>
    </div>
  );
};

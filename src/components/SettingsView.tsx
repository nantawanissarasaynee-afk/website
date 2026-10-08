import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  HeartPulse,
  Hospital,
  Image as ImageIcon,
  Palette,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { SystemSettings, TriageLevel } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onOpenAlert: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenAlert,
}) => {
  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [newCategory, setNewCategory] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl || '');

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onOpenAlert('ไฟล์ใหญ่เกินไป', 'กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      onOpenAlert('อัปโหลดโลโก้สำเร็จ', 'อัปเดตตัวอย่างภาพโลโก้โรงพยาบาลแล้ว', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  // Add category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (form.customCategories.includes(newCategory.trim())) {
      onOpenAlert('หมวดหมู่ซ้ำ', 'มีหมวดหมู่นี้ในรายการแล้ว', 'warning');
      return;
    }
    setForm((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, newCategory.trim()],
    }));
    setNewCategory('');
  };

  // Remove category
  const handleRemoveCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((c) => c !== cat),
    }));
  };

  // Handle Save
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    onOpenAlert('บันทึกการตั้งค่าสำเร็จ', 'ข้อมูลระบบและเกณฑ์การคัดกรอง Triage ได้รับการอัปเดตแล้ว', 'success');
  };

  // Reset to default
  const handleResetDefaults = () => {
    setForm({
      ...settings,
      hospitalName: 'โรงพยาบาลหลวงพ่อเปิ่น',
      departmentName: 'งานอุบัติเหตุฉุกเฉินและนิติเวช',
      affiliation: 'สังกัดกระทรวงสาธารณสุข',
    });
    onOpenAlert('คืนค่าเริ่มต้น', 'โหลดข้อมูลตั้งค่าเริ่มต้นเรียบร้อยแล้ว', 'info');
  };

  const triageKeys: TriageLevel[] = ['R', 'E', 'U', 'S', 'N'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Hospital className="w-5 h-5 text-[#0C7C82]" />
            ตั้งค่าระบบโรงพยาบาลและเกณฑ์บริการ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดชื่อหน่วยงาน, สังกัด, โลโก้, เกณฑ์คัดกรอง Triage 5 ระดับ และประเภทงานบริการผู้ป่วย
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>คืนค่ามาตรฐาน</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            style={{ backgroundColor: '#0C7C82' }}
            className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Hospital Info & Logo Upload */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0C7C82]" />
            ข้อมูลทั่วไปและเอกลักษณ์หน่วยงาน
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Logo Preview and Upload */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
              <span className="text-xs font-bold text-slate-700 mb-2">
                โลโก้โรงพยาบาล (Preview ไม่บังคับ)
              </span>

              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden mb-3 p-1">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Hospital className="w-10 h-10 text-slate-300" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>เลือกรูปภาพ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
                    title="ลบโลโก้"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                รองรับไฟล์ PNG, JPG, SVG ไม่เกิน 2MB
              </span>
            </div>

            {/* Hospital names and affiliation */}
            <div className="md:col-span-8 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อโรงพยาบาล *
                </label>
                <input
                  type="text"
                  required
                  value={form.hospitalName}
                  onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่องาน / แผนก *
                </label>
                <input
                  type="text"
                  required
                  value={form.departmentName}
                  onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อสังกัด *
                </label>
                <input
                  type="text"
                  required
                  value={form.affiliation}
                  onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Triage 5-Level Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />
            การตั้งค่าการคัดกรองผู้ป่วย 5 ระดับ (Resuscitation, Emergency, Urgent, Semi-Urgent, Non-Urgent)
          </h3>

          <div className="space-y-3">
            {triageKeys.map((key) => {
              const cfg = form.triageConfig[key];
              return (
                <div
                  key={key}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-xs"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {key}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{cfg.name}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{cfg.label}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={cfg.desc}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          triageConfig: {
                            ...form.triageConfig,
                            [key]: { ...cfg, desc: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Color picker for this triage */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">สี:</span>
                    <input
                      type="color"
                      value={cfg.color}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          triageConfig: {
                            ...form.triageConfig,
                            [key]: { ...cfg, color: e.target.value },
                          },
                        })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">{cfg.color}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Custom Service Categories */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#0C7C82]" />
            ประเภทผู้ป่วยและภาระงานบริการ
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            (ตรวจโรคทั่วไป, ตรวจโรคนอกเวลา, อุบัติเหตุจราจร, อุบัติเหตุทั่วไป, นอนรพ., ส่งต่อผู้ป่วย, ชันสูตรพลิกศพ, CPR ฯลฯ)
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="เพิ่มประเภทผู้ป่วยใหม่ เช่น พิษสารเคมี, จิตเวชฉุกเฉิน..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              style={{ backgroundColor: '#0C7C82' }}
              className="px-4 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มประเภท</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.customCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 transition"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-400 hover:text-rose-600 transition"
                  title="ลบ"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            style={{ backgroundColor: '#0C7C82' }}
            className="px-6 py-3 text-white rounded-2xl text-xs font-bold hover:brightness-110 shadow-lg shadow-teal-900/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>
      </form>
    </div>
  );
};

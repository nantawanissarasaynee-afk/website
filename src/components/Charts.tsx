import React, { useEffect, useRef } from 'react';

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
  subTitle?: string;
}

export const CanvasDonutChart: React.FC<DonutChartProps> = ({ data, title, subTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 280;
    const height = rect.height || 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.62;

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = outerRadius - innerRadius;
      ctx.stroke();
      return;
    }

    let startAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // subtle separator line
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      startAngle += sliceAngle;
    });

    // Center text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Sarabun, sans-serif';
    ctx.fillText(`${total}`, centerX, centerY - 6);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Sarabun, sans-serif';
    ctx.fillText('เคสทั้งหมด', centerX, centerY + 14);
  }, [data]);

  return (
    <div className="flex flex-col items-center w-full">
      {title && (
        <div className="text-center mb-1">
          <h4 className="text-base font-bold text-slate-800">{title}</h4>
          {subTitle && <p className="text-xs text-slate-500">{subTitle}</p>}
        </div>
      )}
      <div className="w-full flex justify-center py-2 relative">
        <canvas ref={canvasRef} className="w-[280px] h-[220px]" />
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-full text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-700 font-medium">{item.label}</span>
            <span className="font-bold text-slate-900">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BarChartProps {
  categories: string[];
  series: {
    name: string;
    color: string;
    data: number[];
  }[];
  title?: string;
}

export const CanvasBarChart: React.FC<BarChartProps> = ({ categories, series, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 480;
    const height = rect.height || 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // find max value
    let maxVal = 10;
    series.forEach((s) => {
      s.data.forEach((val) => {
        if (val > maxVal) maxVal = val;
      });
    });
    maxVal = Math.ceil(maxVal * 1.15);

    // Draw horizontal grid lines
    const gridLines = 4;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.font = '11px Sarabun, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(String(val), padding.left - 8, y);
    }

    const numCategories = categories.length;
    const catWidth = chartW / numCategories;
    const numSeries = series.length;
    const groupPadding = 12;
    const availableWidth = catWidth - groupPadding * 2;
    const barWidth = Math.max(8, availableWidth / numSeries - 4);

    categories.forEach((cat, catIdx) => {
      const groupX = padding.left + catIdx * catWidth + groupPadding;

      // Category label
      ctx.textAlign = 'center';
      ctx.fillStyle = '#475569';
      ctx.font = '11px Sarabun, sans-serif';
      ctx.fillText(cat, groupX + availableWidth / 2, padding.top + chartH + 20);

      // Bars
      series.forEach((s, sIdx) => {
        const val = s.data[catIdx] || 0;
        const barH = (val / maxVal) * chartH;
        const x = groupX + sIdx * (barWidth + 4);
        const y = padding.top + chartH - barH;

        ctx.fillStyle = s.color;
        // Rounded bar top
        const radius = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + barH);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
        ctx.lineTo(x + barWidth, y + barH);
        ctx.closePath();
        ctx.fill();

        // Bar value on top if space
        if (barH > 15) {
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 10px Sarabun, sans-serif';
          ctx.fillText(String(val), x + barWidth / 2, y - 6);
        }
      });
    });
  }, [categories, series]);

  return (
    <div className="w-full">
      {title && <h4 className="text-base font-bold text-slate-800 mb-2">{title}</h4>}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <canvas ref={canvasRef} className="w-full min-w-[360px] h-[240px]" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs">
        {series.map((s, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600 font-medium">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

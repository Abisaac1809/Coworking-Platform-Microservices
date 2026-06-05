interface KpiCardProps {
  label: string
  value: string | number
  accentColor?: string
}

export default function KpiCard({ label, value, accentColor = '#0d9488' }: KpiCardProps) {
  return (
    <div
      className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-6 py-5"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <p className="text-[13px] font-medium text-[#64748b] mb-2">{label}</p>
      <p className="text-[28px] font-bold text-[#1e293b] tracking-[-0.02em]">{value}</p>
    </div>
  );
}

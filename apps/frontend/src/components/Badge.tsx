const GREEN = 'bg-[#dcfce7] text-[#16a34a]';
const AMBER = 'bg-[#fef9c3] text-[#ca8a04]';
const BLUE = 'bg-[#dbeafe] text-[#2563eb]';
const GRAY = 'bg-[#f1f5f9] text-[#94a3b8]';
const RED = 'bg-[#fee2e2] text-[#dc2626]';

// Lookup is case-insensitive (keys stored lowercased) to tolerate backend
// casing differences (e.g. 'pagado' vs 'pagada', 'PENDIENTE' vs 'pendiente').
const variants: Record<string, string> = {
  // spaces
  available: GREEN,
  disponible: GREEN,
  reservada: BLUE,
  ocupada: RED,
  maintenance: AMBER,
  mantenimiento: AMBER,
  // billing
  pending: AMBER,
  pendiente: AMBER,
  paid: GREEN,
  pagado: GREEN,
  pagada: GREEN,
  cancelled: `${GRAY} line-through`,
  cancelada: `${GRAY} line-through`,
  // reservations
  confirmed: GREEN,
  confirmada: GREEN,
  completed: BLUE,
  completada: BLUE,
  // misc
  urgent: `${RED} font-semibold`,
  user: BLUE,
  admin: RED,
};

interface BadgeProps {
  status: string
}

export default function Badge({ status }: BadgeProps) {
  const classes = variants[String(status).toLowerCase()] ?? `${GRAY} text-[#64748b]`;
  return (
    <span
      className={`inline-flex items-center px-[10px] py-[4px] rounded-[20px] text-[12px] font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

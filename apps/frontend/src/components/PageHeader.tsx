interface PageHeaderProps {
  title: string
  children?: React.ReactNode
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-[24px] font-bold text-[#1e293b] tracking-[-0.02em]">{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

import Link from 'next/link';

function buildPageList(current: number, total: number): (number | '...')[] {
  const result: (number | '...')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) {
      result.push(p);
    } else if (result[result.length - 1] !== '...') {
      result.push('...');
    }
  }
  return result;
}

const linkCls =
  'inline-flex items-center justify-center px-3 py-[5px] text-[12px] rounded-[6px] border transition-colors';

interface Props {
  page: number;
  totalPages?: number;
  hasNext?: boolean;
}

export default function PaginationBar({ page, totalPages, hasNext }: Props) {
  const hasPrev = page > 1;
  const showNext = totalPages != null ? page < totalPages : (hasNext ?? false);
  const resolvedTotal = totalPages ?? 0;

  if (!hasPrev && !showNext) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
      <span className="text-[12px] text-[#94a3b8]">
        {resolvedTotal > 0 ? `Página ${page} de ${resolvedTotal}` : `Página ${page}`}
      </span>

      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link
            href={`?page=${page - 1}`}
            className={`${linkCls} border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488]`}
          >
            ← Anterior
          </Link>
        ) : (
          <span className={`${linkCls} border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed`}>
            ← Anterior
          </span>
        )}

        {resolvedTotal > 1 &&
          buildPageList(page, resolvedTotal).map((item, idx) =>
            item === '...' ? (
              <span key={`dots-${idx}`} className="text-[#94a3b8] px-1 text-[13px]">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={`?page=${item}`}
                className={[
                  'inline-flex items-center justify-center w-8 h-8 text-[12px] rounded-[6px] border transition-colors',
                  item === page
                    ? 'bg-[#0d9488] text-white border-[#0d9488]'
                    : 'border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488]',
                ].join(' ')}
              >
                {item}
              </Link>
            ),
          )}

        {showNext ? (
          <Link
            href={`?page=${page + 1}`}
            className={`${linkCls} border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488]`}
          >
            Siguiente →
          </Link>
        ) : (
          <span className={`${linkCls} border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed`}>
            Siguiente →
          </span>
        )}
      </div>
    </div>
  );
}

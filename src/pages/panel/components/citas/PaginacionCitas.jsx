// src/pages/panel/components/citas/PaginacionCitas.jsx

export default function PaginacionCitas({
  totalItems,
  pageSize,
  page,
  onChangePage,
}) {
  if (totalItems <= pageSize) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="flex items-center justify-between mt-4 text-xs text-neutral-600">
      <span>
        Mostrando {startIndex + 1}–{endIndex} de {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onChangePage(Math.max(1, currentPage - 1))}
          className={`px-2 py-1 rounded border ${
            currentPage === 1
              ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
              : "border-neutral-300 hover:bg-neutral-100"
          }`}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onChangePage(Math.min(totalPages, currentPage + 1))}
          className={`px-2 py-1 rounded border ${
            currentPage === totalPages
              ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
              : "border-neutral-300 hover:bg-neutral-100"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

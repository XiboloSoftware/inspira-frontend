export default function BloqueItem({ bloque, onSelect }) {
  return (
    <button
      onClick={() => onSelect(bloque)}
      className="
        w-full flex items-center justify-between
        bg-[#E8F4FF] border border-[#9ACEFF]
        rounded-xl p-3
        hover:bg-[#9ACEFF]
        transition
      "
    >
      <div className="text-[#023A4B] font-semibold">
        {bloque.hora_inicio} — {bloque.hora_fin}
      </div>

      <span
        className="
          px-3 py-1 rounded-lg
          text-white text-sm font-medium
          bg-[#F49E4B] hover:bg-[#D88436]
        "
      >
        Seleccionar
      </span>
    </button>
  );
}

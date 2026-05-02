// src/pages/panel/components/SidebarItem.jsx
export default function SidebarItem({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium rounded-[9px] mb-0.5 transition-all " +
        (active
          ? "bg-white/20 text-white font-semibold shadow-sm"
          : "text-white/70 hover:bg-white/10 hover:text-white")
      }
    >
      {icon && <span className="text-[15px] shrink-0 w-5 text-center">{icon}</span>}
      {label}
    </button>
  );
}

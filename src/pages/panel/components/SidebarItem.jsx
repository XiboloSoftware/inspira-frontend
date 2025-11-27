// src/pages/panel/components/SidebarItem.jsx
export default function SidebarItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left px-4 py-3 text-sm rounded-xl mb-1 transition " +
        (active
          ? "bg-white/15 text-white font-semibold"
          : "text-white/80 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </button>
  );
}

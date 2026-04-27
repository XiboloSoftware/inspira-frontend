// src/pages/panel/components/SidebarItem.jsx
export default function SidebarItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left px-3 py-2 text-sm rounded-lg mb-0.5 transition " +
        (active
          ? "bg-white/15 text-white font-semibold"
          : "text-white/75 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </button>
  );
}

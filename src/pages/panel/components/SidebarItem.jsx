// src/pages/panel/components/SidebarItem.jsx
export default function SidebarItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left px-4 py-3 text-sm font-medium rounded-lg mb-1 transition " +
        (active
          ? "bg-white/20 text-white font-semibold"
          : "text-white/75 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </button>
  );
}

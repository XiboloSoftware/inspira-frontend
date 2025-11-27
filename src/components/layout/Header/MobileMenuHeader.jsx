// src/components/layout/Header/MobileMenuHeader.jsx
export default function MobileMenuHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-primary font-bold text-lg">Menú</span>
      <button onClick={onClose} className="text-2xl leading-none">
        ×
      </button>
    </div>
  );
}

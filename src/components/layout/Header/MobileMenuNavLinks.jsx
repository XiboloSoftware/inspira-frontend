// src/components/layout/Header/MobileMenuNavLinks.jsx
import { navItems } from "./header.data";
import NavItem from "./NavItem";

export default function MobileMenuNavLinks({ onClose }) {
  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavItem key={item.label} item={item} onClick={onClose} />
      ))}
    </ul>
  );
}

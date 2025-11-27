import { navItems } from "./header.data";
import NavItem from "./NavItem";

export default function MainNav() {
  return (
    <div className="w-full bg-secondary-light">
      <div className="w-full px-6">
        {/* Desktop nav */}
        <nav className="hidden md:flex justify-center">
          <ul className="flex items-center gap-6 py-2">
            {navItems.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        <div className="md:hidden h-1" />
      </div>
    </div>
  );
}

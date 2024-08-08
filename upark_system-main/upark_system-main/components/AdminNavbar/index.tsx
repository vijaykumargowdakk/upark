"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/admin", label: "Products" },

  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col justify-between gap-1 md:gap-2 min-w-full   text-sm md:text-md">
      {navigationItems.map((item) => (
        <li
          key={item.href}
          className={
            pathname === item.href
              ? "bg-blue-800 hover:bg-neutral-800 px-4 py-2  rounded-md"
              : "hover:bg-neutral-800 px-4 py-2 rounded-md"
          }
        >
          <Link className="min-w-full" href={item.href}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

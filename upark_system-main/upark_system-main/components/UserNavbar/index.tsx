"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineDashboard, MdAddShoppingCart } from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { FaRegUserCircle , FaCar, FaAddressCard,FaChartLine, FaParking} from "react-icons/fa";

const navigationItems = [
  { href: "/dashboard", label: "Vehicle Entry", icon: <FaCar size={20} /> },
  {
    href: "/dashboard/billing",
    label: "Vehicle Exit and Billing",
    icon: <FaAddressCard size={20} />,
  },
  // {
  //   href: "/dashboard/status",
  //   label: "View Status",
  //   icon: <IoFastFoodOutline size={20} />,
  // },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: <FaChartLine size={20} />,
  },
  {
    href: "/dashboard/slots",
    label: "Manage Slots",
    icon: <FaParking size={20} />,
  },
];

export default function UserNavbar() {
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
          <Link
            className="min-w-full flex flex-row items-center gap-2"
            href={item.href}
          >
          {item.icon} {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

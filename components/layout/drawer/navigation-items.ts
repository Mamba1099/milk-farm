import { Icons } from "@/components/icons";
import { NavigationItem } from "@/lib/types";

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Icons.home,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
  },
  {
    name: "Animals",
    href: "/animals",
    icon: Icons.cow,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
    subItems: [
      {
        name: "All Animals",
        href: "/animals",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
      {
        name: "Add Animal",
        href: "/animals/add",
        roles: ["FARM_MANAGER"],
      },
      {
        name: "Health Records",
        href: "/animals/treatments",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
    ],
  },
  {
    name: "Production",
    href: "/production",
    icon: Icons.milk,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
    subItems: [
      {
        name: "Daily Records",
        href: "/production",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
      {
        name: "Add Production",
        href: "/production/add",
        roles: ["FARM_MANAGER", "EMPLOYEE"],
      },
      {
        name: "Serving Records",
        href: "/production/serving",
        roles: ["FARM_MANAGER"],
      },
    ],
  },
  {
    name: "Employees",
    href: "/employees",
    icon: Icons.users,
    roles: ["FARM_MANAGER"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Icons.analytics,
    roles: ["FARM_MANAGER", "EMPLOYEE"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: Icons.barChart,
    roles: ["FARM_MANAGER"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Icons.settings,
    roles: ["FARM_MANAGER"],
  },
];

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  subItems?: NavigationSubItem[];
}

export interface NavigationSubItem {
  name: string;
  href: string;
  roles: string[];
}

export interface SidebarProps {
  className?: string;
  expandedItems: string[];
  onToggleExpansion: (itemName: string) => void;
  onCloseDrawer: () => void;
}

export interface MobileHeaderProps {
  onOpenDrawer: () => void;
}

export interface DrawerNavigationProps {
  children: React.ReactNode;
}

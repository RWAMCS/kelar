"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, Wallet, User as UserIcon, Target } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stats', href: '/stats', icon: PieChart },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] mx-auto bg-white border-t border-gray-100 h-16 px-2 pb-safe-bottom z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex h-full items-center justify-between w-full overflow-x-auto gap-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href as any} className="flex flex-col items-center justify-center min-w-[60px] h-full space-y-1">
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={isActive ? "text-primary" : "text-gray-400"} 
              />
              <span className={`text-[10px] whitespace-nowrap font-medium ${isActive ? "text-primary" : "text-gray-400"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

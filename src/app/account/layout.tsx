'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import { User, Package, MapPin, LogOut, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const accountNav = [
  { href: '/account', label: 'Dashboard', icon: User, exact: true },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/addresses', label: 'Address Book', icon: MapPin },
  { href: '/account/change-password', label: 'Change Password', icon: LockKeyhole },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Don't show the account shell on login/register/forgot-password pages
  const isAuthPage =
    pathname === '/account/login' ||
    pathname === '/account/register' ||
    pathname.startsWith('/account/forgot-password');

  if (isAuthPage) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FDFCF8] pt-20">
          {children}
        </div>
      </>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFCF8] pt-20">
        <div className="w-full px-4 md:px-8 lg:px-12 py-10">
          {/* Page Title */}
          <h1 className="text-3xl font-bold font-heading mb-8 uppercase tracking-wider">
            DASHBOARD
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
            {/* Sidebar Navigation (Desktop) */}
            <aside className="hidden lg:block">
              <nav className="space-y-1 sticky top-28">
                {accountNav.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && item.href !== '/account';
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors border-l-2',
                        isActive
                          ? 'border-black text-black bg-black/[0.03]'
                          : 'border-transparent text-neutral-500 hover:text-black hover:border-black/20'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wider text-neutral-500 hover:text-red-600 transition-colors border-l-2 border-transparent w-full text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </aside>

            {/* Mobile Navigation (Horizontal Tabs) */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <nav className="flex gap-0 min-w-max border-b border-black/10">
                {accountNav.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && item.href !== '/account';

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-4 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2',
                        isActive
                          ? 'border-black text-black'
                          : 'border-transparent text-neutral-400 hover:text-black'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap text-neutral-400 hover:text-red-600 transition-colors border-b-2 border-transparent cursor-pointer"
                >
                  Logout
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <main className="min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

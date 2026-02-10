'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ForceProfileUpdateModal } from '@/components/ForceProfileUpdateModal';
import {
  LayoutGrid,
  PlusCircle,
  Settings,
  Home,
  UserCircle,
  LogOut,
  ShieldCheck,
  Menu,
  ShoppingBag,
  Heart,
  Megaphone, // 👈 Imported for Ads
  Users      // 👈 Imported for User Manager
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  useSidebar, 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/favorites', label: 'Saved Farms', icon: Heart },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/listings', label: 'My Listings', icon: LayoutGrid },
  { href: '/dashboard/listings/new', label: 'Create Listing', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const ADMIN_EMAIL = "wnyaunwa@gmail.com";

// Helper to trigger mobile menu
function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button onClick={toggleSidebar} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
      <Menu size={24} />
    </button>
  );
}

// Wrapper for links to handle mobile closing automatically
function SidebarLink({ item, isActive }: { item: any, isActive: boolean }) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={item.label}
      className="hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
    >
      <Link href={item.href} onClick={handleClick}>
        <item.icon />
        <span>{item.label}</span>
      </Link>
    </SidebarMenuButton>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      const unsub = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
          if (doc.exists()) setProfile(doc.data());
        },
        (error) => console.log("Profile stream closed")
      );
      return () => unsub();
    }
  }, [currentUser]);

  return (
    <SidebarProvider>
      <ForceProfileUpdateModal />

      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="bg-huku-beige border-r border-huku-tan text-slate-800">
          <SidebarContent>
            <SidebarHeader className="p-4 border-b border-huku-tan">
              <div className="flex items-center gap-3 overflow-hidden transition-all duration-200">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage src={profile?.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                    {profile?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm text-sidebar-foreground truncate">
                    {profile?.displayName || "Farmer"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {currentUser?.email}
                  </span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarMenu className="p-2 space-y-1">
              
              {/* Back to Homepage Button */}
              <SidebarMenuItem>
                <SidebarLink 
                  item={{ href: '/', label: 'Back to Market', icon: ShoppingBag }} 
                  isActive={false} 
                />
              </SidebarMenuItem>
              
              <div className="my-2 border-t border-huku-tan/30 mx-2" />

              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarLink item={item} isActive={pathname === item.href} />
                </SidebarMenuItem>
              ))}

              {/* 🔒 SUPER ADMIN SECTION */}
              {currentUser?.email === ADMIN_EMAIL && (
                <>
                  <div className="my-2 border-t-2 border-orange-200 mx-2" />
                  
                  {/* Section Label */}
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-data-[collapsible=icon]:hidden">
                    Super Admin
                  </div>

                  <SidebarMenuItem>
                    <SidebarLink 
                      item={{ href: '/admin/ads', label: 'Ads Manager', icon: Megaphone }} 
                      isActive={pathname === '/admin/ads'} 
                    />
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarLink 
                      item={{ href: '/admin/users', label: 'User Manager', icon: Users }} 
                      isActive={pathname === '/admin/users'} 
                    />
                  </SidebarMenuItem>
                </>
              )}

            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-huku-tan">
            <LogoutButton logoutAction={logout} />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-slate-50/50 w-full overflow-x-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:hidden">
            <MobileSidebarTrigger />
            <h1 className="text-lg font-headline font-bold text-slate-800">
              {menuItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </header>
          
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function LogoutButton({ logoutAction }: { logoutAction: () => void }) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLogout = () => {
    logoutAction();
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
      onClick={handleLogout}
    >
      <LogOut size={16} className="mr-2" />
      <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
    </Button>
  );
}
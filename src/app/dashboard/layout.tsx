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
  Menu 
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
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/listings', label: 'My Listings', icon: LayoutGrid },
  { href: '/dashboard/listings/new', label: 'Create Listing', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const ADMIN_EMAIL = "wnyaunwa@gmail.com";

// Helper Component for the Trigger Button
function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button onClick={toggleSidebar} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
      <Menu size={24} />
    </button>
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
        {/* UPDATED: Added huku-beige background and huku-tan border */}
        <Sidebar collapsible="icon" className="bg-huku-beige border-r border-huku-tan text-slate-800">
          <SidebarContent>
            {/* UPDATED: Border color */}
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {currentUser?.email === ADMIN_EMAIL && (
                <>
                  <div className="my-2 border-t border-slate-200 mx-2" />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/dashboard/admin'}
                      className="bg-red-50 text-red-700 hover:bg-red-100 font-bold"
                    >
                      <Link href="/dashboard/admin">
                        <ShieldCheck />
                        <span>Super Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          {/* UPDATED: Border color */}
          <SidebarFooter className="p-4 border-t border-huku-tan">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-slate-50/50 w-full overflow-x-hidden">
          {/* Mobile Header */}
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
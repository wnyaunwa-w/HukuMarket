'use client';

import Link from 'next/link';
import {
  Feather,
  LayoutGrid,
  PlusCircle,
  MessageCircle,
  Settings,
  Home,
  PanelLeft,
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';

const menuItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/listings', label: 'My Listings', icon: LayoutGrid },
  { href: '/dashboard/listings/new', label: 'Create Listing', icon: PlusCircle },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden" asChild>
                  <Link href="/">
                    <Feather className="size-5 text-primary" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar>
                    <AvatarImage src={getPlaceholderImage('user-1').imageUrl} />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-sm">Tendai Mwari</span>
                    <span className="text-xs text-muted-foreground truncate">
                      tendai@hukumarket.co.zw
                    </span>
                  </div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarMenu className="p-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <PanelLeft className="h-5 w-5 md:hidden" />
            <h1 className="text-xl font-headline font-semibold">
              {menuItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

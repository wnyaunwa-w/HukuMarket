'use client';

import Link from 'next/link';
import { Feather, LayoutGrid, MessageCircle, Menu, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';

const navLinks = [
  { href: '/', label: 'Marketplace', icon: LayoutGrid },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard', label: 'Dashboard', icon: User },
];

export function Header() {
  const pathname = usePathname();
  const isAuthenticated = true; // Mock authentication state

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-primary flex items-center gap-2',
        pathname === href ? 'text-primary font-semibold' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Feather className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-xl">HukuMarket</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getPlaceholderImage('user-1').imageUrl} alt="User" />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Tendai Mwari</p>
                    <p className="text-xs leading-none text-muted-foreground">tendai@hukumarket.co.zw</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  {navLinks.map((link) => (
                     <Link
                     key={link.href}
                     href={link.href}
                     className={cn(
                       'flex items-center gap-4 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:text-primary',
                       pathname === link.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                     )}
                   >
                     <link.icon className="h-5 w-5" />
                     {link.label}
                   </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

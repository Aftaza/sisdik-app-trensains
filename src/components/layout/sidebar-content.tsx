
'use client';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  User,
  ShieldAlert,
  ScrollText,
  LogOut,
  Moon,
  Sun,
  GraduationCap,
  FileWarning,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useSidebar } from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/students',
    label: 'Siswa',
    icon: Users,
  },
  {
    href: '/teachers',
    label: 'Guru',
    icon: User,
  },
  {
    href: '/violation-types',
    label: 'Tipe Pelanggaran',
    icon: ShieldAlert,
  },
  {
    href: '/sanctions',
    label: 'Sanksi',
    icon: FileWarning,
  },
  {
    href: '/logs',
    label: 'Log Pelanggaran',
    icon: ScrollText,
  },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { open, toggleSidebar } = useSidebar();

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:w-10">
          <div
            className="h-9 w-9 flex items-center text-white justify-center rounded-md bg-gradient-to-r from-sky-400 to-blue-600"
          >
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold text-sidebar-primary font-headline whitespace-nowrap">
              SISDIK
            </h1>
            <p className="text-xs text-sidebar-primary/80 font-headline whitespace-nowrap">
              Sistem Administrasi Kedisiplinan
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
              className="h-10"
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter className="p-4 space-y-2">
        <Separator />
        <div className="flex items-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
              <Avatar className="h-9 w-9">
                  <AvatarImage src="https://placehold.co/40x40" alt="User" data-ai-hint="profile picture"/>
                  <AvatarFallback>BK</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">Guru BK</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">User actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  <span>Ganti Tema</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
         <SidebarMenu>
            <SidebarMenuItem className='hidden group-data-[collapsible=icon]:block'>
                <SidebarMenuButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} tooltip="Ganti Tema" aria-label='Toggle theme' className="h-10">    
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 ease-in-out duration-300" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 ease-in-out duration-300" />
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className='hidden group-data-[collapsible=icon]:block'>
                <SidebarMenuButton tooltip="Keluar" className="h-10">
                  <Link href="/">
                      <LogOut />
                      <span className="sr-only">Keluar</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleSidebar} tooltip={open ? 'Sembunyikan' : 'Tampilkan'} className="h-10">
                    {open ? <PanelLeftClose /> : <PanelLeftOpen />}
                    <span>{open ? 'Sembunyikan' : 'Tampilkan'}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

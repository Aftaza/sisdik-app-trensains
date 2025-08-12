'use client';

import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { students } from '@/lib/data';
import type { Student } from '@/lib/data';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filteredStudents = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.nis.includes(searchQuery)
      );
      setSearchResults(filteredStudents);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  const handleResultClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
    setSearchQuery('');
    setSearchResults([]);
    setIsFocused(false);
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama atau NIS siswa..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
            {isFocused && searchResults.length > 0 && (
              <Card className="absolute top-full mt-2 w-full max-w-[300px] z-50">
                 <div className="p-2">
                    {searchResults.map((student) => (
                        <div
                            key={student.id}
                            onClick={() => handleResultClick(student.id)}
                            className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${student.name.charAt(0)}`} alt="Avatar" data-ai-hint="profile picture"/>
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.nis}</p>
                            </div>
                        </div>
                    ))}
                 </div>
              </Card>
            )}
          </div>
        </form>
      </div>
    </header>
  );
}

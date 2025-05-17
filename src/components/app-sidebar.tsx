'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccountContext } from '@/app/Provider';
import { checkOwner } from '../utils/contractUtilities';
import { Home, User, Plus, Search } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
  {
    title: 'Add Party',
    url: '/add',
    icon: Plus,
  },
  {
    title: 'Search',
    url: '/search',
    icon: Search,
  },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { account } = useContext(AccountContext);
  const [show, setShow] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const isOwner = async () => {
      if (account) {
        const owner = await checkOwner(account);
        setShow(owner);
      } else {
        setShow(false);
      }
    };
    isOwner();
  }, [account]);

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-2xl mb-5'>
            Vote Chain
          </SidebarGroupLabel>
          <SidebarMenu>
            {items.map(item => {
              // Skip Add Party item if user is not owner
              if (item.url === '/add' && !show) return;

              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      href={item.url}
                      className={cn(
                        'flex items-center gap-2',
                        isActive ? 'font-bold' : '',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-primary' : '',
                        )}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

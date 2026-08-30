import { AppShell } from '@mantine/core';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppShell
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding={0}
    >
      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Header />
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

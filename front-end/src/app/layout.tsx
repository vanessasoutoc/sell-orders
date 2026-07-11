import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import QueryProvider from '@/providers/QueryProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Ordens de Venda'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <QueryProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

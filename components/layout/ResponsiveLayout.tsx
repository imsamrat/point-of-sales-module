"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar - contains both desktop sidebar and mobile bottom nav */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import React from 'react';
import {
  SidebarProvider,
  SidebarInset,
} from "../components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="max-w-7xl mx-auto p-6">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
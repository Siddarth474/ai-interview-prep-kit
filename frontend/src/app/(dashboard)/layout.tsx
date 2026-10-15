import React, { Suspense } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true} className="dark bg-[#090b0b] text-white">
      <div className="flex min-h-screen w-full bg-[#090b0b] text-white">
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="flex flex-1 flex-col bg-[#090b0b] text-white min-w-0">
          <div className="flex-1 p-5 sm:p-7 lg:p-8 flex flex-col gap-6 w-full max-w-7xl">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


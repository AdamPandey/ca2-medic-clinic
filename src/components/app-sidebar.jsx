import * as React from "react"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  Pill,
  FileText,
  LogOut,
  Stethoscope
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Link, useLocation } from "react-router-dom"

// Menu items
const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Doctors", url: "/doctors", icon: Stethoscope },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Prescriptions", url: "/prescriptions", icon: Pill },
  { title: "Diagnoses", url: "/diagnoses", icon: FileText },
  { title: "Calendar", url: "/calendar", icon: Calendar }
]

export function AppSidebar({ ...props }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                MC
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-lg">MedClinic</span>
                <span className="text-xs text-muted-foreground">Admin Portal</span>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut />
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
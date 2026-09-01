import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarNavItem } from "../navigation/Sidebar";
import "./AppLayout.css";

const adminNavItems: SidebarNavItem[] = [
    {
        name: "Dashboard",
        icon: "bi-grid-fill",
        path: "/admin/dashboard",
    },
    {
        name: "Student",
        icon: "bi-people-fill",
        path: "/admin/students",
    },
    {
        name: "Offenses",
        icon: "bi-exclamation-triangle-fill",
        path: "/admin/offenses",
    },
];

export default function AdminLayout() {
    return (
        <div className="app-layout">
            <Sidebar navItems={adminNavItems} />
            <div className="app-layout-content">
                <Outlet />
            </div>
        </div>
    );
}
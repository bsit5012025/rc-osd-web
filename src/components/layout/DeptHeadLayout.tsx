import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarNavItem } from "../navigation/Sidebar";
import "./AppLayout.css";

const deptHeadNavItems: SidebarNavItem[] = [
    {
        name: "Profile",
        icon: "bi-person-fill",
        path: "/depthead/profile",
    },
    {
        name: "Dashboard",
        icon: "bi-grid-fill",
        path: "/depthead/dashboard",
    },
    {
        name: "Request",
        icon: "bi-inbox-fill",
        path: "/depthead/requests",
    },
];

export default function DeptHeadLayout() {
    return (
        <div className="app-layout">
            <Sidebar navItems={deptHeadNavItems} />
            <div className="app-layout-content">
                <Outlet />
            </div>
        </div>
    );
}
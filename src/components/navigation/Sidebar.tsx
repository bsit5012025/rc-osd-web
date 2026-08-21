import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export interface SidebarNavItem {
    name: string;
    icon: string;
    path: string;
}

interface SidebarProps {
    navItems?: SidebarNavItem[];
}

const defaultStudentNavItems: SidebarNavItem[] = [
    {
        name: "Profile",
        icon: "bi-person-fill",
        path: "/profile",
    },
    {
        name: "Offenses",
        icon: "bi-exclamation-triangle-fill",
        path: "/offenses",
    },
    {
        name: "Dashboard",
        icon: "bi-grid-fill",
        path: "/dashboard",
    },
    {
        name: "Appeal",
        icon: "bi-person-badge-fill",
        path: "/appeals",
    },
];

const Sidebar = ({ navItems = defaultStudentNavItems }: SidebarProps) => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(true);

    // Reflect the collapsed state on <body> so page-level CSS
    // (content spacing) can react to it without prop drilling.
    useEffect(() => {
        document.body.classList.toggle("sidebar-collapsed", collapsed);

        return () => {
            document.body.classList.remove("sidebar-collapsed");
        };
    }, [collapsed]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("studentId");

        navigate("/login");
    };

    return (
        <nav className={`bottom-nav ${collapsed ? "collapsed" : ""}`}>

            <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <i className="bi bi-list"></i>
            </button>

            <div className="nav-items">

                {navItems.map((item) => (
                    <button
                        type="button"
                        className="nav-item-custom"
                        key={item.name}
                        onClick={() => navigate(item.path)}
                    >
                        <i className={`bi ${item.icon}`}></i>
                        <span>{item.name}</span>
                    </button>
                ))}

                <button
                    type="button"
                    className="nav-item-custom"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>

            </div>
        </nav>
    );
};

export default Sidebar;
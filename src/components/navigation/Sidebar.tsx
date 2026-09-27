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
        name: "Appeal",
        icon: "bi-person-badge-fill",
        path: "/appeals",
    },
];

const Sidebar = ({ navItems = defaultStudentNavItems }: SidebarProps) => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        handleLogout();
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
                    onClick={() => setShowLogoutConfirm(true)}
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>

            </div>

            {showLogoutConfirm && (
                <div
                    className="logout-confirm-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="logout-confirm-title"
                >
                    <div className="logout-confirm-box">
                        <div className="logout-confirm-icon">
                            <i className="bi bi-box-arrow-right"></i>
                        </div>

                        <h5 id="logout-confirm-title" className="logout-confirm-title">
                            Log out?
                        </h5>

                        <p className="logout-confirm-text">
                            You'll need to sign in again to access your account.
                        </p>

                        <div className="logout-confirm-actions">
                            <button
                                type="button"
                                className="logout-confirm-btn logout-confirm-cancel"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="logout-confirm-btn logout-confirm-ok"
                                onClick={confirmLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Sidebar;
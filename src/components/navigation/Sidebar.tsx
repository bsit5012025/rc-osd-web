import { useEffect, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";
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

interface TooltipState {
    label: string;
    top: number;
    left: number;
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
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    useEffect(() => {
        document.body.classList.toggle("sidebar-collapsed", collapsed);

        return () => {
            document.body.classList.remove("sidebar-collapsed");
        };
    }, [collapsed]);

    // Tooltips are only needed while the labels are hidden (collapsed sidebar)
    useEffect(() => {
        setTooltip(null);
    }, [collapsed]);

    const showTooltip = (
        e: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>,
        label: string
    ) => {
        if (!collapsed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            label,
            top: rect.top + rect.height / 2,
            left: rect.right + 8,
        });
    };

    const hideTooltip = () => setTooltip(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("studentId");

        navigate("/login");
    };

    return (
        <>
            <nav className={`bottom-nav ${collapsed ? "collapsed" : ""}`}>

                <button
                    type="button"
                    className="sidebar-toggle-btn"
                    onClick={() => {
                        hideTooltip();
                        setCollapsed((prev) => !prev);
                    }}
                    onMouseEnter={(e) => showTooltip(e, "Expand menu")}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip(e, "Expand menu")}
                    onBlur={hideTooltip}
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
                            onClick={() => {
                                hideTooltip();
                                navigate(item.path);
                            }}
                            onMouseEnter={(e) => showTooltip(e, item.name)}
                            onMouseLeave={hideTooltip}
                            onFocus={(e) => showTooltip(e, item.name)}
                            onBlur={hideTooltip}
                            aria-label={item.name}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            <span>{item.name}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        className="nav-item-custom"
                        onClick={handleLogout}
                        onMouseEnter={(e) => showTooltip(e, "Logout")}
                        onMouseLeave={hideTooltip}
                        onFocus={(e) => showTooltip(e, "Logout")}
                        onBlur={hideTooltip}
                        aria-label="Logout"
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>

                </div>
            </nav>

            {tooltip && (
                <div
                    className="sidebar-tooltip"
                    role="tooltip"
                    style={{ top: tooltip.top, left: tooltip.left }}
                >
                    {tooltip.label}
                </div>
            )}
        </>
    );
};

export default Sidebar;
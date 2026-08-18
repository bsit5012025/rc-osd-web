import { useNavigate } from "react-router-dom";
import "./BottomNavigationBar.css";

const BottomNav = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("studentId");

        navigate("/login");
    };

    const navItems = [
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

    return (
        <nav className="bottom-nav">
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

export default BottomNav;
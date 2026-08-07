import "./BottomNavigationBar.css";

const BottomNav = () => {
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
    {
      name: "Logout",
      icon: "bi-box-arrow-right",
      path: "/logout",
    },
  ];

  return (
    <nav className="bottom-nav">
        <div className="nav-items">
            {navItems.map((item) => (
                <a href="#" className="nav-item-custom" key={item.name}>
                    <i className={`bi ${item.icon}`}></i>
                    <span>{item.name}</span>
                </a>
            ))}
        </div>
    </nav>
  );
};

export default BottomNav;
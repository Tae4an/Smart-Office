import { NavLink } from "react-router-dom";
import '../../styles/layout.css';

const BottomNav = () => {
    const menuItems = [
        { path: "/home", label: "Home", icon: "fas fa-home" },
        { path: "/calendar", label: "Calendar", icon: "fas fa-calendar" },
        { path: "/messenger", label: "Messages", icon: "fas fa-comment" },
        { path: "/meeting", label: "Meeing", icon: "fas fa-video" },
        { path: "/file", label: "File", icon: "fas fa-file" }
    ];

    return (
        <nav className="bottom-nav">
            <ul className="nav-list">
                {menuItems.map((item) => (
                    <li key={item.path} className="nav-item">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            end={item.path === '/'}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default BottomNav;
import { NavLink } from "react-router-dom";
import PropTypes from 'prop-types';
import '../../styles/layout.css';

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
    const menuItems = [
        { path: "/home", label: "Home", icon: "fas fa-home" },
        { path: "/resume", label: "Resume", icon: "fas fa-file-alt" },
        { path: "/projects", label: "Projects", icon: "fas fa-folder-open" },
        { path: "/contact", label: "Contact", icon: "fas fa-phone" },
        { path: "/calendar", label: "Calendar", icon: "fas fa-calendar" },
        { path: "/messenger", label: "Messenger", icon: "fas fa-comment" },
        { path: "/ai", label: "AI", icon: "fas fa-robot" },
        { path: "/hub", label: "Hub", icon: "fas fa-cubes" },
        { path: "/meeting", label: "Meeting", icon: "fas fa-video" },
        { path: "/employee", label: "Emp", icon: "fas fa-users" },
        { path: "/document", label: "Doc", icon: "fas fa-file" }
    ];

    return (
        <>
            <aside className={`sidebar ${isMenuOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/home" className="brand">
                        <span className="brand-text">Start Bootstrap</span>
                    </NavLink>
                </div>
                <nav className="nav-menu">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    end={item.path === '/'}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <div
                className={`sidebar-overlay ${isMenuOpen ? 'show' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            />
        </>
    );
};

Sidebar.propTypes = {
    isMenuOpen: PropTypes.bool.isRequired,
    setIsMenuOpen: PropTypes.func.isRequired
}

export default Sidebar;